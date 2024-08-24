// Using the provided API key
const apiKey = 'AIzaSyCFfNriuvYiGI2STi1uubmxr5tyibbmgjs';
const searchEngineId = 'YOUR_SEARCH_ENGINE_ID'; // Replace with your actual Search Engine ID

// Selecting DOM elements
const searchBox = document.getElementById('searchBox');
const resultsList = document.getElementById('results');
const loadingSpinner = document.getElementById('loading');
const imageSearchCheckbox = document.getElementById('imageSearch');
const newsSearchCheckbox = document.getElementById('newsSearch');
const googleCSE = document.getElementById('googleCSE');
const customSearch = document.getElementById('customSearch');
const searchTypeRadios = document.getElementsByName('searchType');

// Event listener for radio buttons
searchTypeRadios.forEach(radio => {
    radio.addEventListener('change', function() {
        if (this.value === 'google') {
            googleCSE.style.display = 'block';
            customSearch.style.display = 'none';
        } else {
            googleCSE.style.display = 'none';
            customSearch.style.display = 'block';
        }
    });
});

// Event listener for Enter key press
searchBox.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        performSearch();
    }
});

// Real-time suggestions
searchBox.addEventListener('input', function() {
    const query = searchBox.value.trim();
    if (query.length > 2) {
        fetchSuggestions(query);
    } else {
        clearSuggestions();
    }
});

function fetchSuggestions(query) {
    const suggestionsUrl = `https://www.googleapis.com/customsearch/v1/suggest?q=${encodeURIComponent(query)}&key=${apiKey}&cx=${searchEngineId}`;
    
    fetch(suggestionsUrl)
        .then(response => response.json())
        .then(data => {
            displaySuggestions(data);
        })
        .catch(error => {
            console.error('Error fetching suggestions:', error);
        });
}

function displaySuggestions(suggestions) {
    const suggestionsBox = document.getElementById('suggestionsBox');
    suggestionsBox.innerHTML = '';
    suggestions.forEach(suggestion => {
        const suggestionItem = document.createElement('div');
        suggestionItem.textContent = suggestion;
        suggestionItem.addEventListener('click', () => {
            searchBox.value = suggestion;
            performSearch();
        });
        suggestionsBox.appendChild(suggestionItem);
    });
    suggestionsBox.style.display = 'block';
}

function clearSuggestions() {
    const suggestionsBox = document.getElementById('suggestionsBox');
    suggestionsBox.innerHTML = '';
    suggestionsBox.style.display = 'none';
}

// Perform search function
function performSearch() {
    const query = searchBox.value.trim();
    resultsList.innerHTML = '';

    if (!query) {
        alert('Please enter a search query.');
        return;
    }

    loadingSpinner.style.display = 'block';

    let searchType = '';
    if (imageSearchCheckbox.checked) searchType = '&searchType=image';
    if (newsSearchCheckbox.checked) searchType = '&tbm=nws';

    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}${searchType}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            loadingSpinner.style.display = 'none';

            if (data.items && data.items.length > 0) {
                data.items.forEach(item => {
                    const li = document.createElement('li');

                    if (imageSearchCheckbox.checked && item.pagemap && item.pagemap.cse_image) {
                        li.innerHTML = `
                            <a href="${item.link}" target="_blank">${item.title}</a>
                            <img src="${item.pagemap.cse_image[0].src}" alt="${item.title}" class="result-image">
                            <p>${item.snippet}</p>
                        `;
                    } else {
                        li.innerHTML = `
                            <a href="${item.link}" target="_blank">${item.title}</a>
                            <p>${item.snippet}</p>
                        `;
                    }

                    resultsList.appendChild(li);
                });
            } else {
                resultsList.innerHTML = '<li>No results found.</li>';
            }
        })
        .catch(error => {
            console.error('Error fetching search results:', error);
            loadingSpinner.style.display = 'none';
            resultsList.innerHTML = '<li>Error fetching search results.</li>';
        });
}
