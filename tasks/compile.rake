require 'fileutils'
require 'rake/clean'

CLEAN.include("test/coverage")

CLOBBER.include("viking.js")

file "viking.js" => FileList["lib/**/*.js"] do
  FileUtils.rm_f('./viking.js')
  File.open('./viking.js', "w") do |file|
    
    file.write(asset_pipeline['viking.js'].to_s)
  end
end

desc "Compile viking.js"
task :compile => [:clobber, "viking.js"]