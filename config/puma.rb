workers ENV.fetch("PUMA_WORKERS",1).to_i
thread_count = ENV.fetch("THREAD_COUNT",10).to_i
threads thread_count, thread_count

tag "staqadmin"
preload_app!

rackup      DefaultRackup
port        ENV["PORT"]     ||  3000
environment ENV["RACK_ENV"] ||= "development"

on_worker_boot do
  # see https://devcenter.heroku.com/articles/deploying-rails-applications-with-the-puma-web-server#on-worker-boot
end
