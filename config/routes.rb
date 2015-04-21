Rails.application.routes.draw do
  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  root 'home#index'

  get 'user' => 'user#index'
  post 'user' => 'user#create'
  post 'user/login' => 'user#login'
  post 'user/:userid' => 'user#update'
  get 'user/:userid/games' => 'game#list_by_user'
  get 'user/:userid/users' => 'user#index_with_playing'
  get 'user/:userid/:gameid' => 'game#status_check'

  post 'game/automatch' => 'game#automatch'
  post 'game/challenge' => 'game#challenge'
  get 'game/:gameid/accept' => 'game#accept'

  get 'game/:gameid/nextcards' => 'card#get_cards'
  get 'game/:gameid/:userid' => 'game#retrieve'
  post 'game/:gameid' => 'game#update_game'

  get 'card' => 'card#index'
  post 'card' => 'card#create'
  post 'card/:cardid' => 'card#update'
  get 'card/:cardid' => 'card#retrieve'

  post 'messages/:gameid' => 'message#create'
  get 'messages/:gameid/:userid' => 'message#index'


  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end
