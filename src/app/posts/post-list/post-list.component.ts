import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';

import { Post } from '../post.model';
import { PostsService } from '../posts.service';

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

  // DEPENDENCY INJECTION
  constructor(public postsService: PostsService) {}

  ngOnInit() {
    this.isLoading = true;
    // Fetch all posts on class initialization
    this.postsService.getPosts(this.postsPerPage, this.currentPage); //Trigger http request to fetch posts from server

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
  }

  ngOnDestroy() {
    // Remove/Cancel the subscription whenever the component is destroyed (or is out of DOM)
    // AND prevent any memory leaks
    this.postsSub.unsubscribe();
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
