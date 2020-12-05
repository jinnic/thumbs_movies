const loader = document.querySelector('#loader-view');
loader.style.display = "none"

const searchHeaders = ['#', 'Title', 'Release Year'];
const movieDetailHeaders = ['Title', 'Director', 'Release Year','Description', 'Rate the movie'];
const thumbsHeaders = ['Title',	'Thumbs Up',	'Thumbs Down']

const table = document.querySelector('#movie-table');

//Event Objects
const searchForm = document.querySelector("#searchForm");
const ratedMovieBtn = document.querySelector("#ratedMoviesBtn");


const detailedView = document.querySelector("#detailed-view");
const likesTable = document.querySelector("#likes-view");


let sorted = false;
table.classList.add('hide');
// likesTable.classList.add('hide');
// detailedView.classList.add('hide');

//Event Listeners
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    loader.style.display = "block"
    const searchQuery = e.currentTarget.movieTitle.value.replace(/[" "]/, "+");
    getMovies(searchQuery)
})

ratedMovieBtn.addEventListener('click', showRatedMovies);

//Event Handler
function showRatedMovies(){

    fetch(`http://localhost:3000/movies`)
        .then(r => r.json())
        .then(response => {
            console.log("rated movies : ",response)
            updateTable(response.title, thumbsHeaders, response)

        })
}


//Fetch - RapidApi Info
const rapidapiKey = "184719fc42mshcbbe29616e6b750p10a336jsna8fb741042f1";
const rapidapiHost = "movies-tvshows-data-imdb.p.rapidapi.com";
const rapidapiObj = {
    "method": "GET",
    "headers": {
        "x-rapidapi-key": rapidapiKey,
        "x-rapidapi-host": rapidapiHost
    }
}

const getMovies = (searchQuery)=>{
    fetch(`https://movies-tvshows-data-imdb.p.rapidapi.com/?title=${searchQuery}&type=get-movies-by-title`, rapidapiObj)
    .then(r => r.json())
    .then(response => {
        updateTable(searchQuery,searchHeaders, response.movie_results)
        console.log("movies : ",response.movie_results);
    })
    .catch(err => {
        console.error(err);
    });
}

const getMovieDetail = (e) => {
    loader.style.display = "block"
    const imdbID = e.currentTarget.dataset.imdb_id
    console.log("imdbID : ", imdbID)
    fetch(`https://movies-tvshows-data-imdb.p.rapidapi.com/?imdb=${imdbID}&type=get-movie-details`, rapidapiObj)
        .then(r => r.json())
        .then(response => {
            updateTable(response.title, movieDetailHeaders, [response])
            console.log("movie details : ",response)
        })
}

const  updateRating = (e)=>{
    e.preventDefault();
    const type = e.currentTarget.querySelector('i').className === 'fas fa-thumbs-down' ? 'thumbs_down' : 'thumbs_up';
    const title = e.target.closest("tr").firstElementChild.textContent;
    const imdbID = e.target.closest("tr").firstElementChild.dataset.imdb_id;
    const payLoad = {
        method: 'POST', // or 'PUT'
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
                title: title,
                imdbID: imdbID,
                thumbs_type: type
        }),
    };
    fetch(`http://localhost:3000/movies`, payLoad)
        .then(r => r.json())
        .then(response => {
            console.log("updated thumbs : ", response)
            updateThumbs(response)
        });
}

//Table functions    

const updateTable =(searchQuery, head, movieData)=>{
    const tBody = table.querySelector('#table-body');
    //clear table
    clearTable();

    console.log(!movieData)
    console.log(movieData)
    // when no movie is found send message
    // else generate table
    if (movieData.length === 0) {
        
        let tHead = table.querySelector('#table-header');
        let row = tHead.insertRow();
        let th = document.createElement('TH');
        th.innerHTML = `No movies are rated yet!`;
        row.append(th)
    }else if (!movieData ) {
        let tHead = table.querySelector('#table-header');
        let row = tHead.insertRow();
        let th = document.createElement('TH');
        th.innerHTML = `Sorry! ${searchQuery} is not in the IMDB database.`;
        row.append(th)
    }else{
        //generate table head
        generateTableHead(table, head);
        //generate table
        generateTableBody(tBody, head, movieData)
    }
}

const clearTable =()=>{
    const tBody = table.querySelector('#table-body');
    const tHead = table.querySelector('#table-header');
    tBody.innerHTML = ""
    tHead.innerHTML = ""
}

//Generate Table Head
const generateTableHead = (table, data)=>{
    let tHead = table.querySelector('#table-header');
    let row = tHead.insertRow();
    data.forEach(val =>{
        let th = document.createElement('TH');
        th.innerHTML = val;
        row.append(th)
    })
}

//Generate Table Body
const generateTableBody = (table,head, data) =>{
    //sort data to latest date
    if(data.length > 1){
        data.sort(function(a,b){
            return b.year - a.year 
        })
    }
    
    let num = 1;

    for(const movie of data){
        let row = table.insertRow();
        //For each header generate rows
        for(const key of head){
            let cell = row.insertCell();
            let text = ""
            switch (key){
                case '#':
                    text = num
                    num++
                    cell.innerText = text;
                    row.append(cell)
                    break;
                case 'Release Year':
                    let year = movie.year;
                    text = `${year}`
                    cell.innerText = text;
                    row.append(cell)
                    break;
                case 'Title':
                    let title = movie.title;
                    text = `${title}`
                    cell.innerText = text;
                    cell.classList.add('movieDetailLink');
                    cell.setAttribute('data-imdb_id', movie.imdb_id)
                    cell.addEventListener('click', getMovieDetail);
                    row.append(cell)
                    break;
                case 'Director':
                    text = movie.directors[0];
                    cell.innerText = text;
                    row.append(cell)
                    break;
                case 'Description':
                    text = movie.description;
                    cell.innerText = text;
                    row.append(cell)
                    break;
                case 'Rate the movie':
                    text = `<span class="thumbs">
                                <i class="fas fa-thumbs-down"></i>
                                <span id="thumbsDown"></span> 
                            </span>
                            <span class="thumbs">
                                <i class="fas fa-thumbs-up"></i>
                                <span id="thumbsUp">
                            </span>`
                    
                    cell.innerHTML = text;
                    cell.getElementsByClassName('thumbs')[0].addEventListener('click', updateRating);
                    cell.getElementsByClassName('thumbs')[1].addEventListener('click', updateRating);
                    row.append(cell)
                    break;
                case 'Thumbs Up':
                    text = movie.thumbs_up;
                    cell.innerText = text;
                    row.append(cell)
                    break
                case 'Thumbs Down':
                    text = movie.thumbs_down;
                    cell.innerText = text;
                    row.append(cell)
                    break
            }
        }
    }
    table.classList.remove('hide');
    loader.style.display = "none"
}


const updateThumbs=(data)=>{
    document.querySelector('#thumbsUp').innerHTML = `${data.thumbs_up}`;
    document.querySelector('#thumbsDown').innerHTML = `${data.thumbs_down}`;
}




