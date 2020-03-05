#!/bin/bash

# 1. Add imports to top of build/viking.js.
# 2. Run rake compile to build viking.js at root.
# 3. Copy viking.js into body of build/viking.js.
# 4. Add export to bottom of file.

touch ./build/viking.js \
  && cp ./build/imports.js ./build/viking.js \
  && rake compile \
  && cat ./viking.js >> ./build/viking.js \
  && echo "module.exports = Viking;" >> ./build/viking.js