"use strict";
// VARIABLES
const loggedInUser = getCurrentUser();
const urlParams = new URLSearchParams(window.location.search);
// if not found userId show user profile
let userId = urlParams.get("userId") || loggedInUser.id;

function createPost(data, container, userBtnsContent) {
    const pBody = `
        <div class="card shadow">
            <div class="card-header">
                <div class='user-div'>
                    <img class="avatar rounded-circle me-1" src="${
                        data.author.profile_image
                    }" alt="user">
                    <span class="bold" id="user">@${data.author.username}</span>
                </div>
                ${userBtnsContent}
            </div>
            <div class="card-body" onclick="postClicked(${data.id})">
                <div class="img-cont px-1">
                    <img class="w-100" src="${data.image}" alt="img">
                    <p class="text-secondary">${data.created_at}</p>
                </div>
                <h5 class="card-title">${data.title || ""}</h5>
                <p class="card-text">${data.body}</p>
                <hr>
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-pen" viewBox="0 0 16 16">
                        <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001zm-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708l-1.585-1.585z"/>
                    </svg>
                    <span class="me-2">
                        (${data.comments_count}) comments
                    </span>
                    <span id="post-tags-${data.id}">
                        
                    </span>
                </div>
            </div>
        </div>
    `;
    container.innerHTML += pBody;

    let tagsCont = document.getElementById(`post-tags-${data.id}`);
    for (const tag of data.tags) {
        const tagsContent = `
        <button class="btn btn-sm rounded-5 bg-gray">
            ${tag.name}
        </button>
        `;
        tagsCont.innerHTML += tagsContent;
    }
}

function getUser() {
    axios.get(baseUrl + `users/${userId}`).then((res) => {
        const user = res.data.data;

        // image & main info
        document.getElementById("header-img").src = user.profile_image;
        document.getElementById("info-email").innerHTML =
            user.email || "example@example.com";
        document.getElementById("info-name").innerHTML = user.name;
        document.getElementById("info-username").innerHTML =
            "@" + user.username;
        document.getElementById("header-name").innerHTML = user.username + "'s";

        // posts and comments count
        document.getElementById("posts-count").innerHTML = user.posts_count;
        document.getElementById("comments-count").innerHTML =
            user.comments_count;
    });
}
getUser();

async function getPosts() {
    // turn on loading
    toggleLoader()

    const response = await axios.get(baseUrl + `users/${userId}/posts`);

    // turn off loading
    toggleLoader(false)
    const posts = response.data.data;
    const container = document.getElementById("posts");
    container.innerHTML = "";

    let user = getCurrentUser();
    let isMyPost = user != null && userId == user.id;
    let userBtns = ``;
    for (const post of posts) {
        if (isMyPost) {
            userBtns = `
            <div>
                <button class="btn btn-secondary mx-1" onclick="editPostBtnClicked('${encodeURIComponent(
                    JSON.stringify(post)
                )}')">edit</button>
                <button class="btn btn-danger" onclick="deletePostBtnClicked('${encodeURIComponent(
                    JSON.stringify(post)
                )}')">delete</button>
            </div>
            `;
        }
        createPost(post, container, userBtns);
    }
}
getPosts();
