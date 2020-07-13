How to use generate your own data (since you asked).

1. Queue up a data dump from Facebook -> [https://www.facebook.com/dyi/](https://www.facebook.com/dyi/)
2. Extract the zip files into this or some other folder. They should be named `facebook-yourname-1,2,3/` etc.
3. Set your name at the top of process\_data.py.
4. Run process_data.py from the directory that has all of your zip files as subfolders, it should pick up messages from them.
5. sketch.ts will load from data.json so make sure they're in the same folder.
6. `yarn --ignore-engines` to install yarn dependencies, and `yarn dev` to host locally at [http://localhost:1234/people/index.html](http://localhost:1234/people/index.html)
7. `yarn deploy` to build for a github pages site
