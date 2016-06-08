require 'fileutils'
require 'rake/clean'

CLEAN.include("test/coverage")

CLOBBER.include("viking.js")

# puts FileList["lib/**/*.{js,js.erb,es6,es6.erb}"]
file "viking.js" => FileList["lib/**/*.js"] do
  FileUtils.rm_f('./viking.js')
  File.open('./viking.js', "w") do |file|
    input = {
          content_type: 'application/ecmascript-6',
          data: asset_pipeline['viking.es6.erb'].source,
          metadata: {},
          load_path: asset_pipeline['viking.es6.erb'].to_hash[:load_path],
          filename: asset_pipeline['viking.es6.erb'].filename,
          cache: Sprockets::Cache.new,
          source_path: asset_pipeline['viking.es6.erb'].logical_path
        }

        puts  Sprockets::BabelProcessor.new().call(input)[:data]
    # options = {
    #   data: asset.source,
    #   environment: asset_pipeline,
    #   cache: asset_pipeline.cache,
    #   uri: asset.uri,
    #   filename: asset.filename,
    #   load_path: load_path,
    #   source_path: source_path,
    #   name: name,
    #   content_type: type,
    #   metadata: {
    #     dependencies: dependencies,
    #     map: []
    #   }
    # }

    # puts Sprockets::BabelProcessor.call(options)
    file.write(asset_pipeline['viking.es6.erb'])
  end
end

desc "Compile viking.js"
task :compile => [:clobber, "viking.js"]
