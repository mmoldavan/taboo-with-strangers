class UserController < ApplicationController
  def index

  end

  def new

  end

  def create

  end

  def update

  end

  def show
    user = {userid: 1, username: 'demo-user', email: 'demo@demo.org', country: 'us', language: 'en', age: '27'}

    render json: user
  end

  def destroy

  end
end
