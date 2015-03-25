require 'test_helper'

class GameControllerTest < ActionController::TestCase
  test "should automatch" do
    get :automatch
    assert_response :success
  end

end
