const search = document.getElementById("search");
const searchButton = document.getElementById("button-search");
const form = document.getElementById("form1");
const SEARCHPATH = "https://api.themoviedb.org/3/search/movie?&api_key=c5a20c861acf7bb8d9e987dcc7f1b558&query=";
const main = document.getElementById("main");
const IMGPATH = "https://image.tmdb.org/t/p/w1280";
const favoriteButton = document.getElementById("favorite-btn");
const searchTitle = document.getElementById("search-title");

let initialMainContent;

function getClassByRate(vote){
    if (vote >= 8) {
        return 'green';
    }
    else if (vote >= 5) {
        return 'orange';
    }
    else {
        return 'red';
    }
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const searchTerm = search.value.trim();

    if (searchTerm) {
        getMovies(SEARCHPATH + searchTerm);
        document.getElementById("genresDiv").style.display = "flex";
        searchTitle.innerHTML = 'Search Results for: ' + searchTerm;
        search.value = '';
    }
    else {
        searchTitle.innerHTML = 'Please enter a search term.';
    }
});

searchButton.addEventListener('click', (e) => {
    e.preventDefault();
    const searchTerm = search.value;

    if (searchTerm) {
        getMovies(SEARCHPATH + searchTerm);
        document.getElementById("genresDiv").style.display = "flex";
        searchTitle.innerHTML = 'Search Results for: ' + searchTerm;
        search.value = '';
    }
    else {
        searchTitle.innerHTML = 'Please enter a search term.';
    }
});

function calculateMoviesToDisplay() {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 689.9) return 10;
    if (screenWidth <= 1021.24) return 20;
    if (screenWidth <= 1353.74) return 21;
    if (screenWidth <= 1684.9) return 20;
    if (screenWidth <= 2017.49) return 20;
    if (screenWidth <= 2349.99) return 18;
    if (screenWidth <= 2681.99) return 21;
    if (screenWidth <= 3014.49) return 24;
    if (screenWidth <= 3345.99) return 27;
    if (screenWidth <= 3677.99) return 20;
    if (screenWidth <= 4009.99) return 22;
    if (screenWidth <= 4340.99) return 24;
    if (screenWidth <= 4673.49) return 26;
    if (screenWidth <= 5005.99) return 28;
    if (screenWidth <= 5337.99) return 30;
    if (screenWidth <= 5669.99) return 32;
    if (screenWidth <= 6001.99) return 34;
    if (screenWidth <= 6333.99) return 36;
    if (screenWidth <= 6665.99) return 38;
    if (screenWidth <= 6997.99) return 40;
    if (screenWidth <= 7329.99) return 42;
    if (screenWidth <= 7661.99) return 44;
    if (screenWidth <= 7993.99) return 46;
    if (screenWidth <= 8325.99) return 48;
    return 20;
}

async function getMovies(url) {
    clearMovieDetails();
    const numberOfMovies = calculateMoviesToDisplay();
    const pagesToFetch = numberOfMovies <= 20 ? 1 : 2;
    let allMovies = [];

    for (let page = 1; page <= pagesToFetch; page++) {
        const response = await fetch(`${url}&page=${page}`);
        const data = await response.json();
        allMovies = allMovies.concat(data.results);
    }

    const popularityThreshold = 0.5;

    allMovies.sort((a, b) => {
        const popularityDifference = Math.abs(a.popularity - b.popularity);
        if (popularityDifference < popularityThreshold) {
            return b.vote_average - a.vote_average;
        }
        return b.popularity - a.popularity;
    });

    if (allMovies.length > 0) {
        showMovies(allMovies.slice(0, numberOfMovies));
        document.getElementById('clear-search-btn').style.display = 'block'; // Show the button
    }
    else {
        main.innerHTML = `<p>No movie with the specified search term found. Please try again.</p>`;
        document.getElementById('clear-search-btn').style.display = 'none'; // Hide the button if no results
    }
}

function clearMovieDetails() {
    const movieDetailsContainer = document.getElementById('movie-details-container');
    if (movieDetailsContainer) {
        movieDetailsContainer.innerHTML = '';
    }
}

function showMovies(movies){
    main.innerHTML = '';
    movies.forEach((movie) => {
        const { id, poster_path, title, vote_average, overview } = movie;
        const movieE1 = document.createElement('div');
        const voteAverage = vote_average.toFixed(1);
        movieE1.classList.add('movie');

        const movieImage = poster_path
            ? `<img src="${IMGPATH + poster_path}" alt="${title}" style="cursor: pointer;" />`
            : `<div class="no-image" style="text-align: center; padding: 20px;">Image Not Available</div>`;

        movieE1.innerHTML = `
            ${movieImage} 
            <div class="movie-info" style="cursor: pointer;">
                <h3>${title}</h3>
                <span class="${getClassByRate(vote_average)}">${voteAverage}</span>
            </div>
            <div class="overview" style="cursor: pointer;">
                <h4>Movie Overview: </h4>
                ${overview}
            </div>`;

        movieE1.addEventListener('click', () => {
            localStorage.setItem('selectedMovieId', id);
            window.location.href = 'movie-details.html';
        });

        main.appendChild(movieE1);
    });
}

function setStarRating(rating) {
    const stars = document.querySelectorAll('.rating .star');
    stars.forEach(star => {
        star.style.color = star.dataset.value > rating ? 'grey' : 'gold';
    });
    document.getElementById('rating-value').textContent = `${rating}.0/5.0`;
}

document.querySelectorAll('.rating .star').forEach(star => {
    star.addEventListener('mouseover', (e) => {
        setStarRating(e.target.dataset.value);
    });

    star.addEventListener('mouseout', () => {
        const movieId = localStorage.getItem('selectedMovieId');
        const savedRatings = JSON.parse(localStorage.getItem('movieRatings')) || {};
        const movieRating = savedRatings[movieId] || 0;
        setStarRating(movieRating);
    });

    star.addEventListener('click', (e) => {
        const movieId = localStorage.getItem('selectedMovieId');
        const rating = e.target.dataset.value;
        const savedRatings = JSON.parse(localStorage.getItem('movieRatings')) || {};
        savedRatings[movieId] = rating;
        localStorage.setItem('movieRatings', JSON.stringify(savedRatings));
        setStarRating(rating);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    initialMainContent = document.getElementById('main').innerHTML;

    const movieId = localStorage.getItem('selectedMovieId');
    if (movieId) {
        fetchMovieDetails(movieId);
    }
    else {
        document.getElementById('movie-details-container').innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; text-align: center; margin-top: 40px; width: 100vw;">
                <h2>Movie details not found.</h2>
            </div>`;
    }

    document.getElementById('clear-search-btn').style.display = 'none';

    updateClock();

    const savedRatings = JSON.parse(localStorage.getItem('movieRatings')) || {};
    const movieRating = savedRatings[movieId] || 0;
    setStarRating(movieRating);
});

document.getElementById('clear-search-btn').addEventListener('click', () => {
    location.reload();
});

let isSignedIn = JSON.parse(localStorage.getItem('isSignedIn')) || false;
updateSignInButton();

function handleSignInOut() {
    const signInOutButton = document.getElementById('googleSignInBtn');
    const signInOutText = signInOutButton.querySelector('span');
    const signInOutIcon = signInOutButton.querySelector('i');

    if (!isSignedIn) {
        signInOutText.textContent = 'Sign Out';
        signInOutIcon.className = 'fas fa-sign-out-alt';
        isSignedIn = true;
        localStorage.setItem('isSignedIn', isSignedIn);
        gapi.auth2.getAuthInstance().signIn();
    }
    else {
        signInOutText.textContent = 'Sign In';
        signInOutIcon.className = 'fas fa-sign-in-alt';
        isSignedIn = false;
        localStorage.setItem('isSignedIn', isSignedIn);
        gapi.auth2.getAuthInstance().signOut();
    }
}

function updateSignInButton() {
    const signInOutButton = document.getElementById('googleSignInBtn');
    const signInOutText = signInOutButton.querySelector('span');
    const signInOutIcon = signInOutButton.querySelector('i');
    if (isSignedIn) {
        signInOutText.textContent = 'Sign Out';
        signInOutIcon.className = 'fas fa-sign-out-alt';
    }
    else {
        signInOutText.textContent = 'Sign In';
        signInOutIcon.className = 'fas fa-sign-in-alt';
    }
}

function initClient() {
    gapi.load('auth2', function() {
        gapi.auth2.init({
            client_id: '154461832638-fpkleb6uhogkacq9k93721o8mjr2qc8t.apps.googleusercontent.com'
        });
    });
}

const twoLetterLangCodes = [
    { "code": "aa", "name": "Afar" },
    { "code": "ab", "name": "Abkhazian" },
    { "code": "ae", "name": "Avestan" },
    { "code": "af", "name": "Afrikaans" },
    { "code": "ak", "name": "Akan" },
    { "code": "am", "name": "Amharic" },
    { "code": "an", "name": "Aragonese" },
    { "code": "ar", "name": "Arabic" },
    { "code": "as", "name": "Assamese" },
    { "code": "av", "name": "Avaric" },
    { "code": "ay", "name": "Aymara" },
    { "code": "az", "name": "Azerbaijani" },
    { "code": "ba", "name": "Bashkir" },
    { "code": "be", "name": "Belarusian" },
    { "code": "bg", "name": "Bulgarian" },
    { "code": "bh", "name": "Bihari languages" },
    { "code": "bi", "name": "Bislama" },
    { "code": "bm", "name": "Bambara" },
    { "code": "bn", "name": "Bengali" },
    { "code": "bo", "name": "Tibetan" },
    { "code": "br", "name": "Breton" },
    { "code": "bs", "name": "Bosnian" },
    { "code": "ca", "name": "Catalan; Valencian" },
    { "code": "ce", "name": "Chechen" },
    { "code": "ch", "name": "Chamorro" },
    { "code": "co", "name": "Corsican" },
    { "code": "cr", "name": "Cree" },
    { "code": "cs", "name": "Czech" },
    {
        "code": "cu",
        "name": "Church Slavic; Old Slavonic; Church Slavonic; Old Bulgarian; Old Church Slavonic"
    },
    { "code": "cv", "name": "Chuvash" },
    { "code": "cy", "name": "Welsh" },
    { "code": "da", "name": "Danish" },
    { "code": "de", "name": "German" },
    { "code": "dv", "name": "Divehi; Dhivehi; Maldivian" },
    { "code": "dz", "name": "Dzongkha" },
    { "code": "ee", "name": "Ewe" },
    { "code": "el", "name": "Greek, Modern (1453-)" },
    { "code": "en", "name": "English" },
    { "code": "eo", "name": "Esperanto" },
    { "code": "es", "name": "Spanish; Castilian" },
    { "code": "et", "name": "Estonian" },
    { "code": "eu", "name": "Basque" },
    { "code": "fa", "name": "Persian" },
    { "code": "ff", "name": "Fulah" },
    { "code": "fi", "name": "Finnish" },
    { "code": "fj", "name": "Fijian" },
    { "code": "fo", "name": "Faroese" },
    { "code": "fr", "name": "French" },
    { "code": "fy", "name": "Western Frisian" },
    { "code": "ga", "name": "Irish" },
    { "code": "gd", "name": "Gaelic; Scomttish Gaelic" },
    { "code": "gl", "name": "Galician" },
    { "code": "gn", "name": "Guarani" },
    { "code": "gu", "name": "Gujarati" },
    { "code": "gv", "name": "Manx" },
    { "code": "ha", "name": "Hausa" },
    { "code": "he", "name": "Hebrew" },
    { "code": "hi", "name": "Hindi" },
    { "code": "ho", "name": "Hiri Motu" },
    { "code": "hr", "name": "Croatian" },
    { "code": "ht", "name": "Haitian; Haitian Creole" },
    { "code": "hu", "name": "Hungarian" },
    { "code": "hy", "name": "Armenian" },
    { "code": "hz", "name": "Herero" },
    {
        "code": "ia",
        "name": "Interlingua (International Auxiliary Language Association)"
    },
    { "code": "id", "name": "Indonesian" },
    { "code": "ie", "name": "Interlingue; Occidental" },
    { "code": "ig", "name": "Igbo" },
    { "code": "ii", "name": "Sichuan Yi; Nuosu" },
    { "code": "ik", "name": "Inupiaq" },
    { "code": "io", "name": "Ido" },
    { "code": "is", "name": "Icelandic" },
    { "code": "it", "name": "Italian" },
    { "code": "iu", "name": "Inuktitut" },
    { "code": "ja", "name": "Japanese" },
    { "code": "jv", "name": "Javanese" },
    { "code": "ka", "name": "Georgian" },
    { "code": "kg", "name": "Kongo" },
    { "code": "ki", "name": "Kikuyu; Gikuyu" },
    { "code": "kj", "name": "Kuanyama; Kwanyama" },
    { "code": "kk", "name": "Kazakh" },
    { "code": "kl", "name": "Kalaallisut; Greenlandic" },
    { "code": "km", "name": "Central Khmer" },
    { "code": "kn", "name": "Kannada" },
    { "code": "ko", "name": "Korean" },
    { "code": "kr", "name": "Kanuri" },
    { "code": "ks", "name": "Kashmiri" },
    { "code": "ku", "name": "Kurdish" },
    { "code": "kv", "name": "Komi" },
    { "code": "kw", "name": "Cornish" },
    { "code": "ky", "name": "Kirghiz; Kyrgyz" },
    { "code": "la", "name": "Latin" },
    { "code": "lb", "name": "Luxembourgish; Letzeburgesch" },
    { "code": "lg", "name": "Ganda" },
    { "code": "li", "name": "Limburgan; Limburger; Limburgish" },
    { "code": "ln", "name": "Lingala" },
    { "code": "lo", "name": "Lao" },
    { "code": "lt", "name": "Lithuanian" },
    { "code": "lu", "name": "Luba-Katanga" },
    { "code": "lv", "name": "Latvian" },
    { "code": "mg", "name": "Malagasy" },
    { "code": "mh", "name": "Marshallese" },
    { "code": "mi", "name": "Maori" },
    { "code": "mk", "name": "Macedonian" },
    { "code": "ml", "name": "Malayalam" },
    { "code": "mn", "name": "Mongolian" },
    { "code": "mr", "name": "Marathi" },
    { "code": "ms", "name": "Malay" },
    { "code": "mt", "name": "Maltese" },
    { "code": "my", "name": "Burmese" },
    { "code": "na", "name": "Nauru" },
    {
        "code": "nb",
        "name": "Bokmål, Norwegian; Norwegian Bokmål"
    },
    { "code": "nd", "name": "Ndebele, North; North Ndebele" },
    { "code": "ne", "name": "Nepali" },
    { "code": "ng", "name": "Ndonga" },
    { "code": "nl", "name": "Dutch; Flemish" },
    { "code": "nn", "name": "Norwegian Nynorsk; Nynorsk, Norwegian" },
    { "code": "no", "name": "Norwegian" },
    { "code": "nr", "name": "Ndebele, South; South Ndebele" },
    { "code": "nv", "name": "Navajo; Navaho" },
    { "code": "ny", "name": "Chichewa; Chewa; Nyanja" },
    { "code": "oc", "name": "Occitan (post 1500)" },
    { "code": "oj", "name": "Ojibwa" },
    { "code": "om", "name": "Oromo" },
    { "code": "or", "name": "Oriya" },
    { "code": "os", "name": "Ossetian; Ossetic" },
    { "code": "pa", "name": "Panjabi; Punjabi" },
    { "code": "pi", "name": "Pali" },
    { "code": "pl", "name": "Polish" },
    { "code": "ps", "name": "Pushto; Pashto" },
    { "code": "pt", "name": "Portuguese" },
    { "code": "qu", "name": "Quechua" },
    { "code": "rm", "name": "Romansh" },
    { "code": "rn", "name": "Rundi" },
    { "code": "ro", "name": "Romanian; Moldavian; Moldovan" },
    { "code": "ru", "name": "Russian" },
    { "code": "rw", "name": "Kinyarwanda" },
    { "code": "sa", "name": "Sanskrit" },
    { "code": "sc", "name": "Sardinian" },
    { "code": "sd", "name": "Sindhi" },
    { "code": "se", "name": "Northern Sami" },
    { "code": "sg", "name": "Sango" },
    { "code": "si", "name": "Sinhala; Sinhalese" },
    { "code": "sk", "name": "Slovak" },
    { "code": "sl", "name": "Slovenian" },
    { "code": "sm", "name": "Samoan" },
    { "code": "sn", "name": "Shona" },
    { "code": "so", "name": "Somali" },
    { "code": "sq", "name": "Albanian" },
    { "code": "sr", "name": "Serbian" },
    { "code": "ss", "name": "Swati" },
    { "code": "st", "name": "Sotho, Southern" },
    { "code": "su", "name": "Sundanese" },
    { "code": "sv", "name": "Swedish" },
    { "code": "sw", "name": "Swahili" },
    { "code": "ta", "name": "Tamil" },
    { "code": "te", "name": "Telugu" },
    { "code": "tg", "name": "Tajik" },
    { "code": "th", "name": "Thai" },
    { "code": "ti", "name": "Tigrinya" },
    { "code": "tk", "name": "Turkmen" },
    { "code": "tl", "name": "Tagalog" },
    { "code": "tn", "name": "Tswana" },
    { "code": "to", "name": "Tonga (Tonga Islands)" },
    { "code": "tr", "name": "Turkish" },
    { "code": "ts", "name": "Tsonga" },
    { "code": "tt", "name": "Tatar" },
    { "code": "tw", "name": "Twi" },
    { "code": "ty", "name": "Tahitian" },
    { "code": "ug", "name": "Uighur; Uyghur" },
    { "code": "uk", "name": "Ukrainian" },
    { "code": "ur", "name": "Urdu" },
    { "code": "uz", "name": "Uzbek" },
    { "code": "ve", "name": "Venda" },
    { "code": "vi", "name": "Vietnamese" },
    { "code": "vo", "name": "Volapük" },
    { "code": "wa", "name": "Walloon" },
    { "code": "wo", "name": "Wolof" },
    { "code": "xh", "name": "Xhosa" },
    { "code": "yi", "name": "Yiddish" },
    { "code": "yo", "name": "Yoruba" },
    { "code": "za", "name": "Zhuang; Chuang" },
    { "code": "zh", "name": "Chinese" },
    { "code": "zu", "name": "Zulu" }
];

document.addEventListener("DOMContentLoaded", function() {
    updateSignInButton();
    initClient();
});

async function fetchMovieDetails(movieId) {
    const code = 'c5a20c861acf7bb8d9e987dcc7f1b558';
    const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${code}&append_to_response=credits,keywords,similar`;
    const url2 = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${code}&append_to_response=videos`;
    const imdbUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${code}&append_to_response=external_ids`;

    try {
        const response = await fetch(url);
        const movie = await response.json();
        const imdbId = movie.imdb_id;
        fetchMovieRatings(imdbId, movie);
        const response2 = await fetch(url2);
        const movie2 = await response2.json();
        const trailers = movie2.videos.results.filter(video => video.type === 'Trailer');
        if (trailers.length > 0) {
            const trailerUrl = `https://www.youtube.com/watch?v=${trailers[0].key}`;
            createTrailerButton(trailerUrl);
        }
    }
    catch (error) {
        console.error('Error fetching movie details:', error);
    }
}

async function fetchMovieRatings(imdbId, tmdbMovieData) {
    const omdbApiKey = '2ba8e536';
    const omdbUrl = `http://www.omdbapi.com/?i=${imdbId}&apikey=${omdbApiKey}`;

    try {
        const response = await fetch(omdbUrl);
        const data = await response.json();
        let imdbRating = data.imdbRating ? data.imdbRating : 'N/A';

        if (imdbRating === 'N/A' && tmdbMovieData.vote_average) {
            imdbRating = tmdbMovieData.vote_average.toFixed(1);
        }

        const rtRatingObj = data.Ratings.find(rating => rating.Source === "Rotten Tomatoes");
        const rtRating = rtRatingObj ? rtRatingObj.Value : 'N/A';

        populateMovieDetails(tmdbMovieData, imdbRating, rtRating);
    }
    catch (error) {
        console.error('Error fetching movie ratings:', error);
        populateMovieDetails(tmdbMovieData, 'N/A', 'N/A');
    }
}

function createTrailerButton(trailerUrl) {
    const trailerButton = document.createElement('button');
    trailerButton.textContent = 'Watch Trailer';
    trailerButton.onclick = () => window.open(trailerUrl, '_blank');
    trailerButton.classList.add('trailer-button');
    trailerButton.style.font = 'inherit';
    trailerButton.title = 'Click to watch the trailer of this movie on YouTube!';

    const movieRating = document.getElementById('movie-rating');
    movieRating.parentNode.insertBefore(trailerButton, movieRating.nextSibling);
}

function toggleFavorite(movie) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (favorites.includes(movie.id)) {
        favorites = favorites.filter(favId => favId !== movie.id);
    }
    else {
        favorites.push(movie.id);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoriteButton(movie.id);
}

function updateFavoriteButton(movieId) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const favoriteButton = document.getElementById('favorite-btn');
    if (favorites.includes(movieId)) {
        favoriteButton.classList.add('favorited');
    }
    else {
        favoriteButton.classList.remove('favorited');
    }
}

function getRtSlug(title) {
    return title.toLowerCase()
        .replace(/part one/g, 'part_1')
        .replace(/-/g, '')
        .replace(/&/g, 'and')
        .replace(/ /g, '_')
        .replace(/[^\w-]/g, '');
}

function populateMovieDetails(movie, imdbRating, rtRating) {
    const movieRating = movie.vote_average.toFixed(1);
    document.getElementById('movie-image').src = `https://image.tmdb.org/t/p/w1280${movie.poster_path}`;
    document.getElementById('movie-title').textContent = movie.title;
    const imdbLink = `https://www.imdb.com/title/${movie.imdb_id}`;
    const rtLink = rtRating !== 'N/A' ? `https://www.rottentomatoes.com/m/${getRtSlug(movie.title)}` : '#';
    document.getElementById('movie-rating').innerHTML = `
        <a id="imdbRatingLink" href="${imdbLink}" target="_blank" title="Click to go to this movie's IMDb page!" style="text-decoration: none; color: inherit;">IMDB Rating: ${imdbRating}</a>
        <br>
        <a id="rtRatingLink" href="${rtLink}" target="_blank" title="Click to go to this movie's Rotten Tomatoes page!" style="text-decoration: none; color: inherit;">Rotten Tomatoes: ${rtRating}</a>
    `;
    document.title = movie.title + " - Movie Details";

    const movieImage = document.getElementById('movie-image');
    const movieDescription = document.getElementById('movie-description');

    if (movie.poster_path) {
        movieImage.src = IMGPATH + movie.poster_path;
        movieImage.alt = movie.title;
    }
    else {
        movieImage.style.display = 'none';
        const noImageText = document.createElement('h2');
        noImageText.textContent = 'Image Not Available';
        noImageText.style.textAlign = 'center';
        document.querySelector('.movie-left').appendChild(noImageText);
    }

    const fullLanguage = twoLetterLangCodes.find(lang => lang.code === movie.original_language).name;

    const overview = movie.overview;
    const genres = movie.genres.map(genre => genre.name).join(', ');
    const releaseDate = movie.release_date;
    const runtime = movie.runtime + ' minutes';
    const budget = movie.budget === 0 ? 'Unknown' : `$${movie.budget.toLocaleString()}`;
    const revenue = movie.revenue === 0 ? 'Unknown' : `$${movie.revenue.toLocaleString()}`;
    const tagline = movie.tagline ? movie.tagline : 'No tagline found';
    const languages = movie.spoken_languages.map(lang => lang.name).join(', ');
    const countries = movie.production_countries.map(country => country.name).join(', ');
    const originalLanguage = fullLanguage;
    const popularityScore = movie.popularity.toFixed(2);
    const status = movie.status;
    const userScore = movie.vote_average;
    const voteCount = movie.vote_count.toLocaleString();
    let keywords = movie.keywords ? movie.keywords.keywords.map(kw => kw.name).join(', ') : 'None Available';
    const similarTitles = movie.similar ? movie.similar.results.map(m => m.title).join(', ') : 'None Available';

    if (keywords.length === 0) {
        keywords = 'None Available';
    }

    document.getElementById('movie-description').innerHTML += `
        <p id="descriptionP"><strong>Description: </strong>${overview}</p>
        <p><strong>Genres:</strong> ${genres}</p>
        <p><strong>Release Date:</strong> ${releaseDate}</p>
        <p><strong>Runtime:</strong> ${runtime}</p>
        <p><strong>Budget:</strong> ${budget}</p>
        <p><strong>Revenue:</strong> ${revenue}</p>
        <p><strong>Tagline:</strong> ${tagline}</p>
        <p><strong>Languages:</strong> ${languages}</p>
        <p><strong>Countries of Production:</strong> ${countries}</p>
        <p><strong>Original Language:</strong> ${originalLanguage}</p>
        <p><strong>Popularity Score:</strong> ${popularityScore}</p>
        <p><strong>Status:</strong> ${status}</p>
        <p><strong>User Score:</strong> ${userScore} (based on ${voteCount} votes)</p>
    `;

    if (movie.credits && movie.credits.crew) {
        const director = movie.credits.crew.find(member => member.job === 'Director');
        if (director) {
            const directorAge = director.birthday ? calculateAge(director.birthday) : 'N/A';
            const directorElement = document.createElement('p');
            directorElement.innerHTML = `<strong>Director:</strong> <a href="../html/director-details.html" class="director-link">${director.name}</a>`;
            directorElement.querySelector('.director-link').addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.setItem('selectedDirectorId', director.id);
                document.title = `${director.name} - Director's Details`;
                window.location.href = 'director-details.html';
            });
            document.getElementById('movie-description').appendChild(directorElement);
        }
    }

    const castHeading = document.createElement('p');
    castHeading.innerHTML = '<strong>Cast:</strong> ';
    document.getElementById('movie-description').appendChild(castHeading);

    if (movie.credits && movie.credits.cast.length > 0) {
        const topTenCast = movie.credits.cast.slice(0, 10);
        topTenCast.forEach((actor, index) => {
            const actorLink = document.createElement('span');
            actorLink.textContent = actor.name;
            actorLink.classList.add('actor-link');
            actorLink.addEventListener('click', () => {
                localStorage.setItem('selectedActorId', actor.id);
                window.location.href = 'actor-details.html';
            });

            castHeading.appendChild(actorLink);

            if (index < topTenCast.length - 1) {
                castHeading.appendChild(document.createTextNode(', '));
            }
        });
    }
    else {
        castHeading.appendChild(document.createTextNode('None available.'));
    }

    const productionCompanies = movie.production_companies;
    const productionCompaniesElement = document.createElement('p');
    productionCompaniesElement.innerHTML = '<strong>Production Companies:</strong> ';

    if (productionCompanies.length === 0) {
        productionCompaniesElement.innerHTML += 'None available.';
    }
    productionCompanies.forEach((company, index) => {
        const companyLink = document.createElement('a');
        companyLink.textContent = company.name;
        companyLink.style.cursor = 'pointer';
        companyLink.style.textDecoration = 'underline';
        companyLink.href = '#';
        companyLink.classList.add('company-link');
        companyLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.setItem('selectedCompanyId', company.id);
            window.location.href = 'company-details.html';
        });

        productionCompaniesElement.appendChild(companyLink);

        if (index < productionCompanies.length - 1) {
            productionCompaniesElement.appendChild(document.createTextNode(', '));
        }
    });

    document.getElementById('movie-description').appendChild(productionCompaniesElement);

    const similarMoviesHeading = document.createElement('p');
    similarMoviesHeading.innerHTML = '<strong>Similar Movies:</strong> ';
    document.getElementById('movie-description').appendChild(similarMoviesHeading);

    if (movie.similar && movie.similar.results.length > 0) {
        movie.similar.results.forEach((similarMovie, index) => {
            const movieLink = document.createElement('span');
            movieLink.textContent = similarMovie.title;
            movieLink.style.cursor = 'pointer';
            movieLink.style.textDecoration = 'underline';
            movieLink.addEventListener('mouseenter', () => {
                movieLink.style.color = '#f509d9';
            });
            movieLink.addEventListener('mouseleave', () => {
                movieLink.style.color = 'white';
            });
            movieLink.addEventListener('click', () => {
                localStorage.setItem('selectedMovieId', similarMovie.id);
                window.location.href = 'movie-details.html';
            });

            similarMoviesHeading.appendChild(movieLink);

            if (index < movie.similar.results.length - 1) {
                similarMoviesHeading.appendChild(document.createTextNode(', '));
            }
        });
    }
    else {
        similarMoviesHeading.appendChild(document.createTextNode('None available.'));
    }

    const keywordsElement = document.createElement('p');
    keywordsElement.innerHTML = `<strong>Keywords:</strong> ${keywords}`;
    movieDescription.appendChild(keywordsElement);
    updateFavoriteButton(movie.id);
    favoriteButton.addEventListener('click', () => toggleFavorite(movie));
}

async function showMovieOfTheDay() {
    const year = new Date().getFullYear();
    const url = `https://api.themoviedb.org/3/discover/movie?api_key=c5a20c861acf7bb8d9e987dcc7f1b558&sort_by=vote_average.desc&vote_count.gte=100&primary_release_year=${year}&vote_average.gte=7`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const movies = data.results;

        if (movies.length > 0) {
            const randomMovie = movies[Math.floor(Math.random() * movies.length)];
            localStorage.setItem('selectedMovieId', randomMovie.id);
            window.location.href = 'movie-details.html';
        }
        else {
            fallbackMovieSelection();
        }
    }
    catch (error) {
        console.error('Error fetching movie:', error);
        fallbackMovieSelection();
    }
}

function fallbackMovieSelection() {
    const fallbackMovies = [432413, 299534, 1726, 562, 118340, 455207, 493922, 447332, 22970, 530385, 27205, 264660, 120467, 603, 577922, 76341, 539, 419704, 515001, 118340, 424, 98];
    const randomFallbackMovie = fallbackMovies[Math.floor(Math.random() * fallbackMovies.length)];
    localStorage.setItem('selectedMovieId', randomFallbackMovie);
    window.location.href = 'movie-details.html';
}

function updateClock() {
    var now = new Date();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var timeString = hours + ':' + minutes;
    document.getElementById('clock').innerHTML = timeString;
}

setInterval(updateClock, 1000);
window.onload = updateClock;
