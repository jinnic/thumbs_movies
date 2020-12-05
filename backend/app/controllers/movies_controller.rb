class MoviesController < ApplicationController
  def index
    movies = Movie.all
    render json: movies
  end

  def create
    movie = Movie.find_by(title: movie_params[:title]) 
    thumbs_type = movie_params[:thumbs_type]== "thumbs_up" ? "up" : "down"
    # byebug
    if movie == nil
        if thumbs_type == "up"
          movie =  Movie.create(title: movie_params[:title], imdb_id: movie_params[:imdbID], thumbs_up: 1)
        elsif thumbs_type == "down"
          movie = Movie.create(title: movie_params[:title],imdb_id: movie_params[:imdbID], thumbs_down: 1)
        end
    elsif movie != nil
      if thumbs_type == "up"
        movie.update(thumbs_up: movie.thumbs_up += 1)
      elsif thumbs_type == "down"
        movie.update(thumbs_down: movie.thumbs_down += 1)
      end 
    end
    # byebug
    render json: movie
  end

  private

  def movie_params
      params.permit(:thumbs_type, :title, :imdbID)
  end
end
