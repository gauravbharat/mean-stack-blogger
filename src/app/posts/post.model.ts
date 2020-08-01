/** Interface: Defines how object looks like but it can't be instantiated.
 * It's more like a contract like enforcing our own type,
 * to force an object looke like this i.e. about how and what data we expect.
 * Import this model file where using Post data
 * i.e. a clear definition of how a Post should look like */
export interface Post {
  id: string;
  title: string;
  content: string;
  imagePath: string;
  creator: string;
}
