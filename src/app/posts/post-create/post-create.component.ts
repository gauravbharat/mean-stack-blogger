import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { PostsService } from '../posts.service';
import { Post } from '../post.model';
import { mimeType } from './mime-type.validator';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css'],
})
export class PostCreateComponent implements OnInit {
  private mode = 'create';
  private postId: string;
  post: Post;
  isLoading = false;
  form: FormGroup;
  imagePreview: string;

  // @Output() postCreated = new EventEmitter<Post>();

  /** Instead of event emitter, using the PostsService
   * Get the current route, exact path, using the ActivatedRoute
   */
  constructor(
    public postsService: PostsService,
    public route: ActivatedRoute
  ) {}

  ngOnInit() {
    /** Initialise FormGroup
     * FormControl takes following arguments:
     * 1. the beginning state
     * 2. validators or form control options.
     * 3. updateOn, a form control option, checks the validity when the control lost focus
     */
    this.form = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)],
      }),
      content: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType],
      }),
    });

    // Get the current path from the injected, activated route using the paramMap observable
    // and since it is a built-in observable, we NEVER need to unsubscribe from it
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      // Check if the current path/route expects the 'postId' param
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.isLoading = true;
        this.postsService.getPost(this.postId).subscribe((postData) => {
          this.isLoading = false;
          this.post = {
            id: postData._id,
            title: postData.title,
            content: postData.content,
            imagePath: postData.imagePath,
          };
          // set form control values
          this.form.setValue({
            title: this.post.title,
            content: this.post.content,
            image: this.post.imagePath,
          });
        });
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }

  onSavePost() {
    if (this.form.invalid) return;
    // this.postCreated.emit(post);
    this.isLoading = true;
    // console.log(this.form.value.image);
    if (this.mode === 'create') {
      this.postsService.addPost(
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
      );
    } else {
      this.postsService.updatePost(
        this.postId,
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
      );
    }

    this.form.reset(); //Clear form values
  }

  onImagePicked(event: Event) {
    /** Inform typescript that the target is an HTML input element,
     * to access its properties, either use =>
     * (<HTMLInputElement>event.target) OR
     * (event.target as HTMLInputElement)
     */
    const file = (event.target as HTMLInputElement).files[0];

    // Patch value targets single control, unlike setValue, and
    // allows to change/set its value.
    // Store the file object
    this.form.patchValue({ image: file });
    // Run the validator on input element
    this.form.get('image').updateValueAndValidity();

    /** Read the file name and store it */
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}
