import { AbstractControl } from '@angular/forms';
import { Observable, Observer, of } from 'rxjs';

/** Synchronous validators can return null object for success and some error code on failure
 * Ayncrhonous validators returns a promise or an observable
 * Promise, Observables & Observer are generic types so they need to be clear what they yeild
 * Promise, as below, shows return a generic key/property name of string type and the value of any
 *
 * Create own Observables using Observalble.create() and emit the fileReader.onloadend results
 *
 * Read the MIME-TYPE of the file using FileReader and Array Buffer. Uint8Array allows to read certain
 * patterns in the file. We don't want to read the file extension since a PDF can be renamed and uploaded
 * as a JPEG. We need to read the ACTUAL file contents to determine the validity of the updloaded image file.
 */
export const mimeType = (
  control: AbstractControl
): Promise<{ [key: string]: any }> | Observable<{ [key: string]: any }> => {
  /** Return null as valid
   * of() is a quick and easy way of adding/creating an observable, which would emit data immediately
   */
  if (typeof control.value === 'string') {
    return of(null);
  }

  const file = control.value as File;
  const fileReader = new FileReader();
  const fileReaderObservable = Observable.create(
    (observer: Observer<{ [key: string]: any }>) => {
      fileReader.addEventListener('loadend', () => {
        // This is the part where the MIME-TYPE of the file is stored 'subarray(0,4)'
        const arr = new Uint8Array(fileReader.result as ArrayBuffer).subarray(
          0,
          4
        );

        let header = '';
        let isValid = false;

        for (let i = 0; i < arr.length; i++) {
          header += arr[i].toString(16); //convert into a hexadecimal string
        }

        // Check the file-type patterns (JavaScript file mime-types)
        switch (header) {
          case '89504e47':
            isValid = true;
            break;
          case 'ffd8ffe0':
          case 'ffd8ffe1':
          case 'ffd8ffe2':
          case 'ffd8ffe3':
          case 'ffd8ffe8':
            isValid = true;
            break;
          default:
            isValid = false; // Or you can use the blob.type as fallback
            break;
        }

        // Emit data: null for valid, and error code for invalid
        if (isValid) {
          observer.next(null);
        } else {
          observer.next({ invalidMimeType: true });
        }

        observer.complete(); // Subscribers know that we are done emitting
      });

      fileReader.readAsArrayBuffer(file);
    }
  );

  return fileReaderObservable;
};
