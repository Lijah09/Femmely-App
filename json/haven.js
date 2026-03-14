renderPosts(); 
document.getElementById("search-input").addEventListener("input", handleSearch);

// search function
function handleSearch() {
    const query = document.getElementById("search-input").value.toLowerCase();
    if (!query) {
        renderPosts();
        return;
    }
    searchPosts(query);
}

function searchPosts(query) {
    const container = document.getElementById("haven-posts-container");
    const category = getHavenCategory();
    let posts = [];

    // if on haven page, search all categories
    if (category === "haven") {
        const homePosts = JSON.parse(localStorage.getItem("haven")) || [];
        const safePosts = JSON.parse(localStorage.getItem("fem-safe")) || [];
        const carePosts = JSON.parse(localStorage.getItem("fem-care")) || [];
        posts.push(...homePosts, ...safePosts, ...carePosts);
        posts.sort((a,b) => b.id - a.id);
    } else {
        posts = JSON.parse(localStorage.getItem(category)) || [];
    }

    // filter posts based on query matching title, content, or author
    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.author.toLowerCase().includes(query)
    );

    // if no results, show message
    if (filteredPosts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p class="haven-t1" style="text-align: center; padding: 20px;">
                    No results found for "${query}". Try searching with different keywords?
                </p>
            </div>
        `;
        return;
    }

    // otherwise, render filtered posts
    container.innerHTML = filteredPosts.map(post => {
        const replies = post.replies || [];
        return `
        <div class="haven-entry-card" id="post-${post.id}">
            <div class="haven-entry-content">
                <div class="haven-entry-content-1">
                    <span class="haven-t1"><b>${post.author}</b> • ${post.timestamp} • ${post.category}</span>
                </div>
                <div class="haven-entry-content-2">
                    <p class="haven-t2">${post.title}</p>
                    <p class="haven-t1">${post.content}</p>
                </div>
                <div class="haven-entry-content-3">
                    <button class="haven-entry-btn" onclick="toggleReplySection(${post.id})">
                        <i class="fa-regular fa-comment"></i>
                        <span class="haven-t3">Replies (${replies.length})</span>
                    </button>
                </div>
                <div id="reply-section-${post.id}" style="display: none;">
                    <div style="margin-top: 15px; padding-left: 20px;">
                        <input id="reply-input-${post.id}" class="haven-post-input haven-t1 btn" placeholder="Write a reply...">
                        <button onclick="submitReply(${post.id}, '${post.category}')" class="haven-entry-btn">
                            Post Reply
                        </button>
                    </div>
                    <div class="replies-container" style="margin-left: 30px; border-left: 2px solid #eee; margin-top: 10px;">
                        ${replies.map(reply => `
                            <div class="reply-item" style="padding: 10px;">
                                <span class="haven-t1" style="font-size: 0.8rem;"><b>${reply.author}</b> • ${reply.timestamp}</span>
                                <p class="haven-t1" style="margin: 5px 0;">${reply.content}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join("");
}

// get category of current page (haven, fem-care, or fem-safe)
function getHavenCategory() {
    const container = document.getElementById("haven-posts-container");
    return container ? container.getAttribute("data-category") : "haven";
}

function renderPosts() {
    const container = document.getElementById("haven-posts-container");
    if (!container) return;

    // get category and posts for that category
    const category = getHavenCategory();
    let posts = [];

    if (category === "haven") {
        // get posts from other categories to show on haven page
        const homePosts = JSON.parse(localStorage.getItem("haven")) || [];
        const safePosts = JSON.parse(localStorage.getItem("fem-safe")) || [];
        const carePosts = JSON.parse(localStorage.getItem("fem-care")) || [];
        // combine all posts into one array for the haven page
        posts.push(...homePosts, ...safePosts, ...carePosts);
        // sort by timestamp (newest first)
        posts.sort((a, b) => b.id - a.id);
    } else {
        // for fem-care and fem-safe, only show posts from that category
        posts = JSON.parse(localStorage.getItem(category)) || [];
    }

    // if no posts, show message
    if (posts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p class="haven-t1" style="text-align: center; padding: 20px;">
                    No posts for now. Be the first to share your story!
                </p>
            </div>
        `;
        return;
    }

    // otherwise, render the posts
    container.innerHTML = posts.map(post => {
        const replies = post.replies || [];
        return `
        <div class="haven-entry-card" id="post-${post.id}">
            <div class="haven-entry-content">
                <div class="haven-entry-content-1">
                    <span class="haven-t1"><b>${post.author}</b> • ${post.timestamp} • ${post.category}</span>
                </div>

                <div class="haven-entry-content-2">
                    <p class="haven-t2">${post.title}</p>
                    <p class="haven-t1">${post.content}</p>
                </div>
                
                <div class="haven-entry-content-3">
                    <button class="haven-entry-btn" onclick="toggleReplySection(${post.id})">
                        <i class="fa-regular fa-comment"></i>
                        <span class="haven-t3">Replies (${replies.length})</span>
                    </button>
                </div>

                <div id="reply-section-${post.id}" style="display: none;">
                    
                    <div style="margin-top: 15px; padding-left: 20px;">
                        <input id="reply-input-${post.id}" class="haven-post-input haven-t1 btn" placeholder="Write a reply...">
                        <button onclick="submitReply(${post.id}, '${post.category}')" class="haven-entry-btn">
                            Post Reply
                        </button>
                    </div>

                    <div class="replies-container" style="margin-left: 30px; border-left: 2px solid #eee; margin-top: 10px;">
                        ${replies.map(reply => `
                            <div class="reply-item" style="padding: 10px;">
                                <span class="haven-t1" style="font-size: 0.8rem;"><b>${reply.author}</b> • ${reply.timestamp}</span>
                                <p class="haven-t1" style="margin: 5px 0;">${reply.content}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div> 
        </div>
        `;
    }).join("");
}

function submitPost() {
    // get element references for object and current category
    const titleInput = document.getElementById("post-title");
    const bodyInput = document.getElementById("post-body");
    const currentUserName = localStorage.getItem('currentUserName');
    const category = getHavenCategory(); // "haven", "fem-care", or "fem-safe"

    // get the actual text
    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    // input validation: empty post not allowed
    if (!title || !body) {
        alert("Please provide both a title and a story!");
        return;
    }

    // create object for post
    const newPost = {
        id: Date.now(), // unique  ID for later deletion
        title: title,
        content: body,
        author: currentUserName || "Anonymous", 
        timestamp: new Date().toLocaleString(),
        category: category
    };

    // save post to localStorage under the correct category
    // get post list, add new post then save new object
    let posts = JSON.parse(localStorage.getItem(category)) || [];
    posts.unshift(newPost); // Adds to the start of the array
    localStorage.setItem(category, JSON.stringify(posts));

    // clear form for next posts
    titleInput.value = "";
    bodyInput.value = "";

    renderPosts();
}

// function to toggle reply box visibility
function toggleReplyBox(postId) {
    const replyBox = document.getElementById(`reply-box-${postId}`);
    if (replyBox) {
        replyBox.style.display = replyBox.style.display === 'none' ? 'block' : 'none';
    }
}

// function to submit a reply to a post
function submitReply(postId, targetCategory) {
    const replyInput = document.getElementById(`reply-input-${postId}`);
    const currentUserName = localStorage.getItem('currentUserName') || "Anonymous";
    const replyContent = replyInput.value.trim();

    if (!replyContent) {
        alert("Reply cannot be empty!");
        return;
    }

    let posts = JSON.parse(localStorage.getItem(targetCategory)) || [];

    // find the post to reply to...
    posts = posts.map(post => {
        if (post.id === postId) {
            if (!post.replies) post.replies = [];
            post.replies.push({
                author: currentUserName,
                content: replyContent,
                timestamp: new Date().toLocaleString()
            });
        }
        return post;
    });

    localStorage.setItem(targetCategory, JSON.stringify(posts));

    // clear reply input
    replyInput.value = "";

    // refresh posts to show new reply
    renderPosts();

    toggleReplySection(postId);
}

function toggleReplySection(postId) {
    const section = document.getElementById(`reply-section-${postId}`);
    
    // Toggle between "none" and "block"
    if (section.style.display === "none") {
        section.style.display = "block";
    } else {
        section.style.display = "none";
    }
}