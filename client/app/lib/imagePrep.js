/* eslint-env browser */

import Promise from 'bluebird';
import { Buffer } from 'buffer';
import extend from 'lodash/extend';
import arrayBufferConcat from 'array-buffer-concat';
import { parse } from 'babel-loader?{presets:["es2015"]}!icc';
import loadImage from 'blueimp-load-image';
import canvasToBlob from 'blueimp-canvas-to-blob';

class ImagePrep {
  constructor (options) {
    this.options = extend({
      maxWidth: Infinity,
      maxHeight: Infinity,
      quality: 100,
      downsamplingRatio: 0.5,
      maxMetaDataSize: 1024000,
    }, options);

    // Create parser array for APP2 segment
    loadImage.metaDataParsers.jpeg[0xffe2] = [];

    // Add parser
    loadImage.metaDataParsers.jpeg[0xffe2].push((dataView, offset, length, data, options) => {
      // Grab the ICC profile from the APP2 segment(s) of the header
      const iccChunk = dataView.buffer.slice(offset + 18, offset + length);

      if (iccChunk.byteLength > 0) {
        if (data.iccProfile) {
          // Profile is split accross multiple segments so we need to concatenate the chunks
          data.iccProfile = arrayBufferConcat(data.iccProfile, iccChunk);
        } else {
          data.iccProfile = iccChunk;
        }
      }
    });
  }

  loadImage (fileOrBlob) {
    return new Promise((resolve, reject) => {
      loadImage.parseMetaData(fileOrBlob, (data) => {
        // if (!data.imageHead) {
        //   reject(new Error('No image header'));
        //   return;
        // }

        let exif;

        if (data.exif) {
          exif = data.exif.getAll();
        }

        let profile;

        if (data.iccProfile) {
          // Convert the profile ArrayBuffer into a normal buffer for the `icc` parser module
          const buffer = new Buffer(data.iccProfile.byteLength);
          const view = new Uint8Array(data.iccProfile);
          for (let i = 0; i < buffer.length; ++i) {
            buffer[i] = view[i];
          }

          // Parse the profile
          profile = parse(buffer);
        }

        loadImage(fileOrBlob, (resizedImageCanvas) => {
          resizedImageCanvas.toBlob((resizedBlob) => {
            const parts = [];

            if (data.imageHead) {
              // Combine data.imageHead with the image body of a resized file
              // to create scaled images with the original image meta data, e.g.:
              parts.push(data.imageHead);

              // Resized images always have a head size of 20 bytes,
              // including the JPEG marker and a minimal JFIF header:
              parts.push(loadImage.blobSlice.call(resizedBlob, 20));
            } else {
              parts.push(resizedBlob);
            }

            const blob = new Blob(parts, {
              type: resizedBlob.type,
            });

            resolve({
              blob,
              profile,
              exif,
            });
          },
            fileOrBlob.type,
            this.options.quality / 100,
          );
        }, {
          maxWidth: this.options.maxWidth,
          maxHeight: this.options.maxHeight,
          downsamplingRatio: this.options.downsamplingRatio,
          canvas: true,
        });
      }, {
        // Increase the metadata size for CMYK profiles
        // these are larger as they contain more info
        // required to convert the colorspace(?):
        maxMetaDataSize: 1024000,
        disableImageHead: false,
      });
    });
  }
}

export default ImagePrep;
