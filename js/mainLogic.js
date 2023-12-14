"use strict";
// MAIN VARIABLE
const baseUrl = "https://tarmeezacademy.com/api/v1/";

// ui functions
function showAlert(message, type) {
    const alertPlaceholder = document.getElementById("alertPlaceholder");

    const wrapper = document.createElement("div");
    wrapper.innerHTML = [
        `<div id="alert" class="alert alert-${type} alert-dismissible" role="alert">`,
        `   <div>${message}</div>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        "</div>",
    ].join("");

    alertPlaceholder.append(wrapper);

    setTimeout(() => {
        const alert = bootstrap.Alert.getOrCreateInstance("#alert");
        alert.close();
    }, 5000);
}

function setupUI() {
    // get the token
    const token = localStorage.getItem("token");
    // the buttons
    const login = document.getElementById("login-btn");
    const register = document.getElementById("register-btn");
    const logout = document.getElementById("logout-btn");
    const addBtn = document.getElementById("add-btn");
    // profile
    const profile = document.getElementById("profile");
    const usernameP = document.getElementById("username");
    const profileImg = document.getElementById("profile-img");
    // create a comment div
    const commentDiv = document.getElementById("add-comment");
    if (token != null) {
        // user logged in
        login.style.display = "none";
        register.style.display = "none";

        if (addBtn) {
            addBtn.style.display = "block";
        } else if (commentDiv) {
            commentDiv.style.display = "flex";
        }
        logout.style.display = "block";

        profile.style.display = "flex";
        const user = getCurrentUser();
        usernameP.innerHTML = "@" + user.username;
        profileImg.src = user.profile_image;
    } else {
        login.style.display = "block";
        register.style.display = "block";

        if (addBtn) {
            addBtn.style.display = "none";
        } else if (commentDiv) {
            commentDiv.style.display = "none";
        }
        logout.style.display = "none";
        profile.style.display = "none";
    }
}
setupUI();

function closeModal(id) {
    const modal = document.getElementById(`${id}`);
    const modalInstance = bootstrap.Modal.getInstance(modal);
    modalInstance.hide();
}

function toggleLoader(show = true) {
    if (show) {
        document.getElementById("loader").style.visibility = "visible";
    } else {
        document.getElementById("loader").style.visibility = "hidden";
    }
}

// user data in local storage
function getCurrentUser() {
    const storageUser = localStorage.getItem("user");
    let user = JSON.parse(storageUser) || null;
    return user;
}

function setUserData(response) {
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
}

// request functions
function getParamsValue(...params) {
    let paramsValue = [];
    for (const param of params) {
        paramsValue.push(document.getElementById(`${param}`).value);
    }
    return paramsValue;
}

function prepareFormData(image, neededData, neededDataValue) {
    neededDataValue.push(image);

    let formData = new FormData();
    for (let i = 0; i < neededData.length; i++) {
        formData.append(neededData[i], neededDataValue[i]);
    }

    return formData;
}

// login code
let loginBtn = document.getElementById("login");
loginBtn.addEventListener("click", () => {
    toggleLoader();
    const [username, password] = getParamsValue("uInput", "pInput");

    const params = {
        username: username,
        password: password,
    };

    axios
        .post(baseUrl + "login", params)
        .then((res) => {
            setUserData(res); // set user data in local storage
            closeModal("loginModal"); // close login modal
            setupUI(); // hide login buttons

            showAlert("Logged In successfully!", "success");
        })
        .catch((err) => {
            console.log(err);

            closeModal("loginModal"); // close login modal
            showAlert(`${err.response.data.message}`, "danger");
        })
        .finally(() => {
            toggleLoader(false); // turn off loading
        });
});

// Register code
let registerBtn = document.getElementById("register");
registerBtn.addEventListener("click", () => {
    toggleLoader();
    const neededData = ["name", "username", "password", "image"];
    const neededDataValue = getParamsValue(
        "r-nInput",
        "r-uNameInput",
        "r-pInput"
    );
    const image = document.getElementById("r-ImageInput").files[0];

    const formData = prepareFormData(image, neededData, neededDataValue);

    axios
        .post(baseUrl + "register", formData)
        .then((res) => {
            setUserData(res); // set user data in local storage
            closeModal("registerModal"); // close register modal
            setupUI(); // hide login buttons

            showAlert("New User Registered successfully!", "success");
        })
        .catch((err) => {
            console.log(err);

            closeModal("registerModal"); // close register modal
            showAlert(`${err.response.data.message}`, "danger");
        })
        .finally(() => {
            toggleLoader(false); // turn off loading
        });
});

// logout code
let logoutBtn = document.getElementById("logout-btn");
logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setupUI();
    showAlert("Logged out successfully!", "success");
});

// create or edit the post
function editPostBtnClicked(postObj) {
    let post = JSON.parse(decodeURIComponent(postObj));

    document.getElementById("postId").value = post.id;
    document.getElementById("postModalTitle").innerHTML = "Edit Post";
    document.getElementById("postTitleInput").value = post.title;
    document.getElementById("postBodyInput").value = post.body;
    document.getElementById("postModalSubmit").innerHTML = "Update";

    let postEditModel = new bootstrap.Modal(
        document.getElementById("addOrEditPostModal"),
        {}
    );
    postEditModel.toggle();
}

function addOrEditPostReq() {
    toggleLoader();
    const neededData = ["title", "body", "image"];
    const neededDataValue = getParamsValue("postTitleInput", "postBodyInput");
    const image = document.getElementById("postImageInput").files[0];
    const formData = prepareFormData(image, neededData, neededDataValue);

    // post id
    let post = document.getElementById("postId");
    let postId = post.value;
    let isCreate = postId == "";

    const headers = {
        authorization: "Bearer " + localStorage.getItem("token"),
        "Content-Type": "multipart/form-data",
    };
    let url = baseUrl + "posts";

    // edit post code
    if (isCreate != true) {
        formData.append("_method", "put");
        url = `${baseUrl}posts/${postId}`;
        post.value = "";
    }

    axios
        .post(url, formData, {
            headers: headers,
        })
        .then(() => {
            closeModal("addOrEditPostModal"); // close modal
            if (isCreate) {
                showAlert("New Post Has Been Created", "success");
            } else {
                showAlert("The Post Has Edit", "success");
            }
            setTimeout(getPosts, 500);
        })
        .catch((err) => {
            showAlert(`${err.message}`, "danger");
        })
        .finally(() => {
            toggleLoader(false); // turn off loading
        });
}

// delete the post
function deletePostBtnClicked(postObj) {
    let post = JSON.parse(decodeURIComponent(postObj));
    document.getElementById("deletePostId").value = post.id;
    let postEditModel = new bootstrap.Modal(
        document.getElementById("deletePostModal"),
        {}
    );
    postEditModel.toggle();
}

function confirmPostDelete() {
    toggleLoader()
    let postId = document.getElementById("deletePostId").value;
    const headers = {
        authorization: "Bearer " + localStorage.getItem("token"),
    };

    axios
        .delete(baseUrl + `posts/${postId}`, {
            headers: headers,
        })
        .then(() => {
            closeModal("deletePostModal"); // close login modal
            showAlert("The post has been deleted successfully!", "success");
            setTimeout(getPosts, 500);
        })
        .catch((err) => {
            closeModal("deletePostModal"); // close login modal
            showAlert(`${err.response.data.message}`, "danger");
        })
        .finally(() => {
            toggleLoader(false) // turn off loading
        });
}

// clicked part of post
function userClicked(userId) {
    window.location = `profile.html?userId=${userId}`;
}

function postClicked(postId) {
    window.location = `postDetails.html?postId=${postId}`;
}
