require 'rubygems'
require 'bundler/setup'
require 'erb'
require 'json'
require 'fileutils'
require 'sprockets'
require 'babel-transpiler'

Dir.glob('tasks/*.rake').each { |r| import r }

# -- Helper for checking the existence of an executable ---------------------
def check(exec, name, url, install=nil)
  return unless `which #{exec}`.empty?
  
  puts "#{name} not found. (#{url})"
  puts "\nInstall via:\n#{install}" if install

  exit(1)
end


# -- Git Repo Info ----------------------------------------------------------
def git_info
  return @git_info if defined?(@git_info)
  
  @git_info = {
    :remotes => `git remote -v`.split(/\n/).map { |r| [:name, :url].zip(r.split(" ").compact).to_h }.uniq,
    :branch => `git branch`.split("\n").delete_if { |i| i[0] != "*" }.first.gsub("* ",""),
    :head => {
      :id => `git log -1 --pretty=format:'%H'`,
      :sha => `git log -1 --pretty=format:'%H'`[0...7],
      :author_name => `git log -1 --pretty=format:'%aN'`,
      :author_email => `git log -1 --pretty=format:'%ae'`,
      :committer_name => `git log -1 --pretty=format:'%cN'`,
      :committer_email => `git log -1 --pretty=format:'%ce'`,
      :message => `git log -1 --pretty=format:'%s'`
    }
  }
end

# -- Current Version of Viking.js -------------------------------------------
def version
  return @version if defined?(@version)
  
  @version = JSON.parse(File.read('package.json'))['version']
end