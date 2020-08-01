import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';

import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css'],
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  private postsSub: Subscription;
  isLoading = false;
  totalPosts = 0;
  postsPerPage = 2;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];

  // Auth related
  userIsAuthenticated = false;
  userId: string;
  private authStatusSubs: Subscription;

  // DEPENDENCY INJECTION
  constructor(
    public postsService: PostsService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.isLoading = true;
    // Fetch all posts on class initialization
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    this.userId = this.authService.getUserId();

    //Trigger http request to fetch posts from server
    /** Create a subscription to listen to data changes. The observer takes 3 arguments -
     * 1st argument - a function which gets executed whenever a new data is emitted
     * 2nd argument - would be called when an error is emitted
     * 3rd argument - function that is called whenever an observable is completed i.e. whenever
     * there are no more values to be expected
     * Store this subscription inside this.postsSub, Subscription 'type' variable
     */
    this.postsSub = this.postsService
      .getPostUpdateListner()
      .subscribe((postData: { posts: Post[]; postCount: number }) => {
        this.isLoading = false;
        this.totalPosts = postData.postCount;
        this.posts = postData.posts;
      });

    /** Post-list component was loaded/initialised after we logged in
     * This means the auth token status emitted could not be captured by the subscriber code or this observer
     * Since the observer was uninitialized to received the emitted data
     *
     * There was no new information pushed when the post-list component was created.
     * Observables push new information and not the current one.
     * Use the current value directly from the service in that case, before executing the subscription code.
     * Alternative was to use a different type of Subject which yields the previous value
     *  */
    this.userIsAuthenticated = this.authService.getIsAuth();

    // Subscribe to auth token status
    this.authStatusSubs = this.authService
      .getAuthStatusListener()
      .subscribe((isAuthorized) => {
        this.userIsAuthenticated = isAuthorized;
        this.userId = this.authService.getUserId();
      });
  }

  ngOnDestroy() {
    // Remove/Cancel the subscription whenever the component is destroyed (or is out of DOM)
    // AND prevent any memory leaks
    this.postsSub.unsubscribe();
    this.authStatusSubs.unsubscribe();
  }

  onDelete(postId: string) {
    this.isLoading = true;

    this.postsService.deletePost(postId).subscribe(() => {
      this.postsService.getPosts(this.postsPerPage, this.currentPage);
    });
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;

    // Increment for backend since it starts from 1 there and here from 0
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }
}

/** Tip:
 * 1. using public keyword, inside the contructor arguments,
 * creates a local copy of that variable, as a class variable
 *
 * 2. OnInit and OnDestroy are Angular component lifecycle methods */
