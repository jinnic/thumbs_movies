class CreateMovies < ActiveRecord::Migration[6.0]
  def change
    create_table :movies do |t|
      t.string :title
      t.string :imdb_id
      t.integer :thumbs_up, :default => 0
      t.integer :thumbs_down, :default => 0

      t.timestamps
    end
  end
end
