desc "run JavaScriptLint on the source"
task :lint do
  check 'eslint', 'JavaScript Lint', 'npm install eslint --global'

  Dir.glob(File.expand_path(File.join(File.dirname(__FILE__), '..', 'lib', '**', '*.js'))).each do |file|
    print "\n%-75s " % file
    system("eslint -c .eslintrc #{file}")
    # system "find lib -name '*.js' -exec jslint --color --predef Backbone --predef _ --predef jQuery --predef strftime --predef Viking --browser --plusplus --nomen --white --regex --vars --sloppy '{}' \\\;"
  end
  print "\n"
end
