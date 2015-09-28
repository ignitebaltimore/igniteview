class PresentationsController < ApplicationController
  helper_method :talks_data

  def index
    talks_path = Pathname(params[:talks_path])

    unless talks_path.exist?
      raise "Cannot find '#{talks_path}'"
    end

    @talks_data = talks_path.read
  end

  # @note
  #   This is obviously super dangerous to run on the Internet;
  #   this code is intended for local use only
  def files
    path = Pathname(params[:talk_path])

    unless path.exist?
      msg = "'#{path}' does not exist"
      logger.error msg
      render :text => msg, :status => :server_error
      return
    end

    logger.info "Sending #{path}..."
    send_file(path)
  end

  private

  attr_reader :title, :talks_data, :intermission_after_talk_number
end
