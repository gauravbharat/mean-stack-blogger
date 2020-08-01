/** Angular Service
 * An alternative to using property and event binding to pass on data between components.
 * Easy access to data from within components in a centralized way
 */

/** There are two options to use this service inside the app -
 * Either add it in the 'providers' array inside the app module (.ts)
 * OR use the Injectable decorator with "providedIn: 'root'". This provides it on the root level.
 * This will ensure that Angular creates a single instance of this service for the ENTIRE app, because
 * we don't want multiple copies of 'post' arrays
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Subject } from 'rxjs'; //An active Observable calling next()
import { map } from 'rxjs/operators'; // an observable operator, similar to js array map() method
import { Router } from '@angular/router';

import { Post } from './post.model';

@Injectable({ providedIn: 'root' })
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{ posts: Post[]; postCount: number }>(); //Pass list of Post[] i/f type as payload

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(postsPerPage: number, currentPage: number) {
    /** let the http get know which data is expected e.g. an object with message and posts properties
     * Use pipe() to add an observable operator 'map'
     * to convert the data as desired, before it being pass to subscribers */

    const queryParms = `?pagesize=${postsPerPage}&page=${currentPage}`;

    this.http
      .get<{ message: string; posts: any; maxPosts: number }>(
        `http://localhost:3000/api/posts${queryParms}`
      )
      .pipe(
        map((postData) => {
          return {
            mappedPosts: postData.posts.map((post) => {
              return {
                title: post.title,
                content: post.content,
                id: post._id,
                imagePath: post.imagePath,
                creator: post.creator,
              };
            }),
            maxPosts: postData.maxPosts,
          };
        })
      )
      .subscribe((transformedPostData) => {
        this.posts = transformedPostData.mappedPosts;
        this.postsUpdated.next({
          posts: [...this.posts],
          postCount: transformedPostData.maxPosts,
        });
      });

    // // Array and objects in JS, and also TypeScript, are reference types and ARE mutable
    // // Hence, pass a TRUE COPY of the array using a spread operator, so the original array
    // // is NOT modified and any unwanted manipulation of posts array is avoided by the calling component
    // return [...this.posts];
  }

  getPostUpdateListner() {
    // Listen to private object, i.e. get the updated array,
    // but can't emit it again from outside this component
    return this.postsUpdated.asObservable();
  }

  getPost(id: string) {
    /** The edit post record is cleared from the post-create page on page refresh
     * Instead of getting the edit-post record from the array, fetch it from database.
     * NOW, the post-create component expects a post synchronously from this asynchornous call
     * So, pass the subscription instead to post-create and get the post value there
     */
    return this.http.get<{
      _id: string;
      title: string;
      content: string;
      imagePath: string;
      creator: string;
    }>(`http://localhost:3000/api/posts/${id}`);

    // Return a cloned/new object using spread operator,
    // to avoid manipulating the original object from the array
    // return { ...this.posts.find((p) => p.id === id) };
  }

  addPost(title: string, content: string, image: File) {
    // Instead of sending json object 'post', send form data to include image file
    // FormData is a JavaScript object that allows to combile text values and blob i.e. file values
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    // 'image' property is used by multer at the backend server. Pass the filename as 3rd argument
    postData.append('image', image, title);

    this.http
      .post<{ message: string; post: Post }>(
        'http://localhost:3000/api/posts',
        postData
      )
      .subscribe((responseData) => {
        // Since we are navigating to post-list component which fetches posts on component load,
        // remove the code to update local post array and triggering the postUpdated.next() observable action
        this.router.navigate(['/']); // Navigate to post-list page i.e. Home page
      });
  }

  // Update post reusing post-create component and
  // fetch the updated version of the post post-list array
  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;

    // Create
    if (typeof image === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
      // Update
    } else {
      postData = {
        id,
        title,
        content,
        imagePath: image,
        creator: null,
      };
    }

    this.http
      .put(`http://localhost:3000/api/posts/${id}`, postData)
      .subscribe((response) => {
        // Since we are navigating to post-list component which fetches posts on component load,
        // remove the code to update local post array and triggering the postUpdated.next() observable action
        this.router.navigate(['/']); // Navigate to post-list page i.e. Home page
      });
  }

  deletePost(postId: string) {
    return this.http.delete(`http://localhost:3000/api/posts/${postId}`);
  }
}

/** Observables, Observers and Subscriptions
 * Observers => subscribes to Observables, or establishes a subscription with an Observable and manages it
 * Three methods that are called on the Observers side i.e. the observer calls -
 * 1. next() => emits new packets of data
 * 2. error() => emits error e.g. on http calls that fails
 * 3. complete() => emits a complete event, to basically say that no more data packets to be emitted, so no more next() calls
 * Observable emits these methods and pass on to the Observer that subscribes to it
 */

/** Observables =>
 * are objects that help us pass data around, and emit data changes.
 * are a part of rxjs package
 * replaces EventEmitter (and the Output and Input Decorators used alongwith EventEmitter), thus,
 * replacing the need to use property and event bindings.
 *
 * Observables can be considered as a 'stream of data' emitted over time,
 * which we can actively or passively manage
 */

/** Generally a normal Observable is PASSIVE e.g. need to wrap callbacks, event source, click listner etc. So it is NOT actively triggered when a new data package is emitted.
 *
 * Subject, a special kind of observable, is ACTIVE. Here we can manually call next(). Actively notify the entire application on data change.
 */

/** Operators are functions, that are applied to the Observables data streams, before the data
 * is ultimately handled in the susbscription.
 * Use pipe() method to add observable operators before the subscribe() method.
 * Pipe() method accepts multiple operators
 */
