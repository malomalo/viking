desc "Build the docco documentation"
task :doc => "viking.js" do
  check 'docco', 'docco', 'https://github.com/jashkenas/docco'
  system 'docco --css docco.css viking.js'
end
