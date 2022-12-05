document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('github-form').addEventListener('submit', handleSubmit);
})

// this function will clear the old results of a given search
function deleteOldSearch(searchToDelete) {
    const oldUserSearch = document.getElementById(searchToDelete);
    while(oldUserSearch.firstChild) {
        oldUserSearch.removeChild(oldUserSearch.firstChild);
    }
}

// this function is called when the submit button is clicked
function handleSubmit (event) {
    event.preventDefault();
    deleteOldSearch('user-list');
    deleteOldSearch('repos-list');
    const searchType = document.querySelector('input[name="search_type"]:checked');
    if (searchType) {
        if (searchType.value === "user") {
            searchUserNames(event);
        }
        else {
            searchReposKeyWord(event);
        }
    }
    else {
        alert('Please select either Username or Repository');
    }    
}

// this function takes a username, gets matching usernames, and calls displayUsers on the result
function searchUserNames (event) {
    fetch(`https://api.github.com/search/users?q=${event.target[0].value}`, {
    })
    .then(res => res.json())
    .then(userNameMatches => displayUsers(userNameMatches.items))
}

// this function takes a repo keyword, gets matching repos, and calls displayRepos on the result
function searchReposKeyWord (event) {
    fetch(`https://api.github.com/search/repositories?q=${event.target[0].value}`, {
    })
    .then(res => res.json())
    .then(repoMatches => displayRepos(repoMatches.items))
}

// this function gets called when a user's repo button is pressed
function handleRepoBtn (event) {
    deleteOldSearch('repos-list');
    fetch(`https://api.github.com/users/${event.target.parentElement.id}/repos`, {
    })
    .then(res => res.json())
    .then(userRepos => displayRepos(userRepos))
}

// this function will take the HTML collection of user results, send it to the distiller, then add it to index.html
function displayUsers(userArray) {
    // send to the distiller
    let distilledUserArray = userDistiller(userArray);

    // build HTML element, add it to the DOM
    for (let user in distilledUserArray) {
        let newUser = document.createElement('li');
        newUser.id = user;
        
        let newUserLink = document.createElement('a');
        newUserLink.href = distilledUserArray[user].profileLink;
        newUserLink.textContent = user;
        newUser.appendChild(newUserLink);

        let newUserImg = document.createElement('img');
        newUserImg.className = 'avatar-img'
        newUserImg.src = distilledUserArray[user].avatar;
        newUser.appendChild(newUserImg);

        let newUserRepoBtn = document.createElement('button');
        newUserRepoBtn.textContent = 'Repositories';
        newUserRepoBtn.addEventListener('click', handleRepoBtn);
        newUser.appendChild(newUserRepoBtn);

        document.getElementById('user-list').appendChild(newUser);
    }
}

// this function takes a username and returns the html collection of matching usernames
function displayRepos(repoArray) {
    // send to the distiller
    let distilledRepoArray = repoDistiller(repoArray);

    // build an HTML element and add it to the DOM
    for (let repo in distilledRepoArray) {
        let newRepo = document.createElement('li');
        newRepo.id = repo;

        let newRepoLink = document.createElement('a');
        newRepoLink.href = distilledRepoArray[repo].repoLink;
        newRepoLink.textContent = repo;
        newRepo.appendChild(newRepoLink);

        document.getElementById('repos-list').appendChild(newRepo);
    }
}

// this function takes the collection of user objects and distills it down to the information we wish to display on the screen
function userDistiller(userArray) {
    let distilledUsers = {};
    for (let user of userArray) {
        distilledUsers = {...distilledUsers, 
            [user.login]: {
                profileLink: user.html_url,
                avatar: user.avatar_url
            }
        }
    }
    return distilledUsers;
}

// this function takes the repo object and returns a distilled version
function repoDistiller(repoArray) {
    let distilledRepos = {};
    for (let repo of repoArray) {
        distilledRepos = {...distilledRepos, 
            [repo.name]: {
                repoLink: repo.html_url
            }
        }
    }
    return distilledRepos;
}