"use strict";

// VARIABLES
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get("postId");

function createPost(data, container) {
    let commentsContent = ``;
    const comments = data.comments;
    for (const comment of comments) {
        commentsContent += `
        <div class="comment-div">
            <div>
                <img class="avatar rounded-circle me-2" src="${comment.author.profile_image}" alt="user">
                <span class="bold">@${comment.author.username}</span>
            </div>
            <div>
                ${comment.body}
            </div>
        </div>
        `;
    }

    const pBody = `
        <div class="card shadow">
            <div class="card-header">
                <div class='user-div'>
                    <img class="avatar rounded-circle me-1" src="${
                        data.author.profile_image
                    }" alt="user">
                    <span class="post-owner-name" id="user">@${
                        data.author.username
                    }</span>
                </div>
            </div>
            <div class="card-body">
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
            <div id="comments">
                ${commentsContent}
            </div>
            <div class="input-group p-2" id="add-comment">
                <input class="form-control" id="comment-input" type="text" placeholder="Add Your Comment Here...">
                <button class="btn btn-primary" id="comment-btn" onclick="commentBtnClicked()">Send</button>
            </div>
        </div>
    `;
    container.innerHTML = pBody;

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

async function getPost(id) {
    // turn on loading
    toggleLoader()

    const res = await axios.get(baseUrl + `posts/${id}`);

    // turn off loading
    toggleLoader(false)
    const post = res.data.data;
    const container = document.getElementById("post-placeholder");
    container.innerHTML = "";
    document.getElementById("username-header").innerHTML =
        post.author.username + "'s post";
    createPost(post, container);
}
getPost(postId);

// create comment
function commentBtnClicked() {
    let commentBody = document.getElementById("comment-input").value;
    let params = {
        body: commentBody,
    };
    let token = localStorage.getItem("token");
    axios
        .post(baseUrl + `posts/${postId}/comments`, params, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .then(() => {
            getPost(postId);
            showAlert("The Comment Has Been Created Successfully", "success");
        })
        .catch((err) => {
            const errorMessage = err.response.data.message;
            showAlert(errorMessage, "danger");
        });
}
