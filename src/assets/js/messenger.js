/**
 *-------------------------------------------------------------
 * Pusher initialization
 *-------------------------------------------------------------
 */
Pusher.logToConsole = messenger.pusher.debug;
const pusher = new Pusher(messenger.pusher.key, {
    encrypted: messenger.pusher.options.encrypted,
    cluster: messenger.pusher.options.cluster,
});

/**
 * Search contacts
 */
function searchUser() {
    let addClass = 'messenger-d-none', removeClass = 'messenger-d-block';
    if ($('#searchChatUser').val()) {
        addClass = 'messenger-d-block';
        removeClass = 'messenger-d-none';
    }
    $('.users-list').removeClass(removeClass).addClass(addClass);
    for (input = document.getElementById("searchChatUser"), filter = input.value.toUpperCase(), ul = document.querySelector(".users-list"), li = ul.getElementsByTagName("li"), i = 0; i < li.length; i++) {
        -1 < li[i].querySelector("p").innerText.toUpperCase().indexOf(filter) ? li[i].style.display = "" : li[i].style.display = "none"
    }
}

/**
 * Select the contact from the search list of contacts
 */
$(document).on('click', '.contact_list', function () {
    messenger.receiverId = $(this).data('id');
    const formData = {
        '_token': messenger.token,
        user_id: messenger.receiverId
    };
    const response = getData(messenger.selectUserRoute, formData);
    let html = '';
    if (!empty(response.data)) {
        $('.users-list').removeClass('messenger-d-block').addClass('messenger-d-none');
        const data = response.data;
        if (!$('.chat_users_lists').hasClass('chat-user_' + data.user_id)) {
            $('.chat_users_lists').removeClass('active');
            html += '<li id="user-chat_' + data.chat_id + '" data-chat-id="' + data.chat_id + '" data-user="' + data.user_id + '" class="chat-user_' + data.user_id + ' active chat_users_lists">\n' +
                '        <a href="javascript: void(0);" class="messenger-unread-msg-user">\n' +
                '            <div class="messenger-d-flex messenger-align-items-center">\n' +
                '                <div class="messenger-chat-user-img messenger-online messenger-align-self-center messenger-me-2 messenger-ms-0">\n' +
                '                    <div class="messenger-avatar-xs">\n' +
                '                        <span class="messenger-avatar-title messenger-rounded-circle messenger-bg-primary messenger-text-white">\n' +
                '                            <span class="messenger-username">' + data.user_avatar_name + '</span>\n' +
                '                            <span class="messenger-user-status"></span>\n' +
                '                        </span>\n' +
                '                    </div>\n' +
                '                </div>\n' +
                '                <div class="messenger-overflow-hidden messenger-me-2">\n' +
                '                    <p class="messenger-text-truncate messenger-chat-username messenger-mb-0">' + data.user_name + '</p>\n' +
                '                    <p class="messenger-text-truncate messenger-text-muted messenger-fs-13 messenger-mb-0 recent-message_' + data.chat_id + '">' + data.message + '</p>\n' +
                '                </div>\n';
            if (!empty(data.unseenMessages)) {
                html += '<div class="messenger-ms-auto">\n' +
                    '      <span class="messenger-badge messenger-badge-soft-danger messenger-rounded p-1 messenger-fs-10" id="unseen-badge_' + data.user_id + '">' + data.unseenMessages + '</span>\n' +
                    '</div>\n';
            }
            html += '</div>\n' +
                '   </a>\n' +
                '</li>';
        }
        userConversation(data);
    }
    $('.messenger-chat-user-list').append(html);
});

/**
 * Recent Chat users list.
 */
$(document).on('click', '.chat_users_lists', function () {
    const chatId = $(this).data('chat-id');
    messenger.receiverId = $(this).data('user');
    $('.chat_users_lists').removeClass('active');
    $(this).addClass('active');
    const formData = {
        "_token": messenger.token,
        chat_id: chatId,
        user_id: messenger.receiverId,
    };
    const response = getData(messenger.conversationRoute, formData);
    if (!empty(response.data)) {
        userConversation(response.data);
        $('#unseen-badge_' + messenger.receiverId).html(0).parent().hide();
    }
});

/**
 * Switch modes Dark/Light
 */
$(document).on('click', '.light-dark-mode', function () {
    updateMessengerMode();
    const colorType = $(this).data('id'); // 0 for light and 1 for dark
    const formData = {
        '_token': messenger.token,
        messenger_mode: colorType,
    };
    $.ajax({
        url: messenger.messengerModeRoute,
        type: 'POST',
        data: formData,
        success: function (response) {
            console.log(response);
        },
        error: function (error) {
            console.log(error);
        }
    });
});

/**
 * Default Mode switcher
 *
 * @param mode
 */
function updateMessengerMode(mode = '') {
    const body = $('body');
    const dataTheme = body.attr('data-bs-theme');

    if (dataTheme === 'dark' || (!empty(mode) && mode === 'light')) {
        body.attr('data-bs-theme', 'light');
        $('.mode-switcher').html('Dark Mode').addClass('messenger-text-black').removeClass('messenger-text-white');
        $('.mode-switcher-icon').addClass('messenger-text-black').removeClass('messenger-text-white');
        $('.light-dark-mode').attr('data-id', 0);
    } else {
        body.attr('data-bs-theme', 'dark');
        $('.mode-switcher').html('Light Mode').addClass('messenger-text-black').removeClass('messenger-text-white');
        $('.mode-switcher-icon').addClass('messenger-text-black').removeClass('messenger-text-white');
        $('.light-dark-mode').attr('data-id', 1);
    }
}

$(document).on('input', '#chat-input', function () {
    $('#galleryfile-input').val('');
    $('.messenger-file_Upload').removeClass('show').html('');
});

$(document).on('change', '#galleryfile-input', function () {
    $('#chat-input').val('');
    const fileList = this.files;
    if (!fileList) return;

    $.each(fileList, function (_, file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const result = e.target.result;
            let html = '';

            const fileSize = file.size;
            let fileSizeDisplay = '';

            const fileExtension = getFileExtension(file.name);

            if (fileSize < 1024) {
                fileSizeDisplay = fileSize + ' bytes';
            } else if (fileSize < 1024 * 1024) {
                fileSizeDisplay = (fileSize / 1024).toFixed(2) + ' KB';
            } else if (fileSize < 1024 * 1024 * 1024) {
                fileSizeDisplay = (fileSize / (1024 * 1024)).toFixed(2) + ' MB';
            } else {
                fileSizeDisplay = (fileSize / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
            }

            if (file.type.startsWith('image')) {
                html = `<div class="messenger-profile-media-img messenger-image_pre">
                            <div class="messenger-media-img-list" id="remove-image">
                                <a href="#">
                                    <img src="${result}" alt="${file.name}" class="messenger-img-fluid">
                                </a>
                                <i class="ri-close-line messenger-image-remove" onclick="removeFile('remove-image')"></i>
                            </div>
                        </div>`;
            } else if (file.type.startsWith('video')) {
                html = `<div class="messenger-profile-media-video messenger-video_pre">
                            <div class="messenger-media-video-list" id="remove-video">
                                <video src="${result}" class="messenger-video-fluid" controls></video>
                                <i class="ri-close-line messenger-video-remove" onclick="removeFile('remove-video')"></i>
                            </div>
                        </div>`;
            } else {
                html = `<div class="messenger-card messenger-p-2 messenger-border attchedfile_pre messenger-d-inline-block messenger-position-relative" id="remove-file">
                            <div class="messenger-d-flex messenger-align-items-center">
                                <div class="messenger-flex-shrink-0 messenger-avatar-xs messenger-ms-1 messenger-me-3">
                                    <div class="messenger-avatar-title messenger-bg-soft-primary messenger-text-primary messenger-rounded-circle">
                                        <i class="${getFileIcon(fileExtension)}"></i>
                                    </div>
                                </div>
                                <div class="messenger-flex-grow-1 messenger-overflow-hidden">
                                    <h5 class="messenger-fs-14 messenger-text-truncate messenger-mb-1">${file.name}</h5>
                                    <p class="messenger-text-muted messenger-text-truncate messenger-fs-13 messenger-mb-0">${fileSizeDisplay}</p>
                                </div>
                                <div class="messenger-flex-shrink-0 messenger-align-self-start messenger-ms-3">
                                    <div class="messenger-d-flex messenger-gap-2">
                                        <i class="ri-close-line messenger-text-muted messenger-attechedFile-remove" onclick="removeFile('remove-file')"></i>
                                    </div>
                                </div>
                            </div>
                        </div>`;
            }

            $('.messenger-file_Upload').addClass('show').html('').html(html);
        };
        reader.readAsDataURL(file);
    });
});

// Function to get file extension
function getFileExtension(fileName) {
    return fileName.split('.').pop().toLowerCase();
}

/**
 * Remove file to be uploaded
 *
 * @param e
 */
function removeFile(e) {
    $('#galleryfile-input').val('');
    $("#" + e).remove();

    if ($('.image-remove').length === 0) {
        $('.messenger-file_Upload').removeClass('show');
    }
}

/**
 * File icons
 *
 * @param extension
 * @returns {*|string}
 */
function getFileIcon(extension) {
    return messenger.fileIcons[extension.toLowerCase()] || 'far fa-file';
}


/**
 * Submit chat form to send message
 */
$('#chat-form').submit(function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    $.ajax({
        url: messenger.chatRoute,
        type: "POST",
        data: formData,
        contentType: false,
        processData: false,
        success: function (response) {
            if (response.success) {
                let recentMessage = 'Click to start conversation.';
                if ($('#chat-input').val()) {
                    recentMessage = $('#chat-input').val();
                } else if ($('#galleryfile-input').val()) {
                    recentMessage = '<i class="ri-file-2-fill"></i> Attachment';
                }
                const chatId = $('#chat_id').val();
                $('.recent-message_' + chatId).html('').html(recentMessage);
                $('#chat-form')[0].reset();
                $('.messenger-file_Upload').removeClass('show').html('');
                const e = document.querySelector("#chat-conversation .messenger-simplebar-content-wrapper");
                e.scrollTop = e.scrollHeight;
            } else {
                alert(response.message);
            }
        },
        error: function (error) {
            let message = '';
            if (typeof (errors.responseJSON) !== 'undefined' && !empty(errors.responseJSON)) {
                let count = 1;
                $.each(errors.responseJSON.errors, function (i, v) {
                    message += count + ') ' + v + ' \n';
                    count++;
                });
            } else {
                message = errors.statusText;
            }
            alert(message);
        }
    })
});

$(document).on('click', '.messenger-user-chat-remove', function () {
    $('#conversation-main').addClass('messenger-d-none').removeClass('messenger-d-block messenger-user-chat-show');
});

/**
 * Chat user conversation to apply.
 *
 * @param data
 */
function userConversation(data) {
    $('#conversation-main').removeClass('messenger-d-none').addClass('messenger-d-block messenger-user-chat-show');
    $('#avatar-user').html('').html(data.user_avatar_name);
    $('#selected-user-name').html('').html(data.user_name);
    $('#chat_id').val(data.chat_id);
    $('.delete-conversation').attr('id', 'delete-conversation_' + data.chat_id);
    $('#receiver_id').val(messenger.receiverId);
    let html = '';
    fetchMessages(data.chat_id);
    if (!empty(data.conversation)) {
        html = data.conversation;
    }
    $('#users-conversation').html('').html(html);
    const e = document.querySelector("#chat-conversation .messenger-simplebar-content-wrapper");
    e.scrollTop = e.scrollHeight;
}

/**
 * Fetch latest message
 *
 * @param chatId
 */
function fetchMessages(chatId) {
    const channel = pusher.subscribe('messenger-' + chatId);

    channel.bind('chatEvent', function (data) {
        let html = '';
        if (!empty(data)) {
            let recentMessage = '';
            if (!empty(data.messages.message)) {
                recentMessage = data.messages.message;
            } else if (!empty(data.messages.message_file)) {
                recentMessage = '<i class="ri-file-2-fill"></i> Attachment';
            }
            $('.recent-message_' + chatId).html('').html(recentMessage);
            let messageAlignClass = 'messenger-left';
            let messageTextClass = 'messenger-text-black';
            let bgSoftLight = 'messenger-bg-soft-dark';
            let border = 'messenger-border-dark';
            if (data.messages.sender_id !== messenger.receiverId) {
                messageAlignClass = 'messenger-right';
                messageTextClass = 'messenger-text-white';
                bgSoftLight = 'messenger-bg-soft-light';
                border = 'messenger-border';
            }
            if (!$('.restrict-duplicate-message').hasClass('duplicate-message_' + data.messages.id)) {
                html += '<li class="messenger-chat-list ' + messageAlignClass + ' restrict-duplicate-message duplicate-message_' + data.messages.id + '" id="message_' + data.messages.id + '">\n' +
                    '       <div class="messenger-conversation-list">';
                if (messageAlignClass === 'messenger-left') {
                    html += '<div class="messenger-chat-avatar" style="height: 2.3rem; width: 2.3rem;">\n' +
                        '        <span class="messenger-avatar-title messenger-rounded-circle messenger-bg-primary messenger-text-white">\n' +
                        '            <span class="messenger-username">' + data.user_avatar_name + '</span>\n' +
                        '        </span>\n' +
                        '    </div>';
                }
                html += '<div class="messenger-user-chat-content">\n' +
                    '            <div class="messenger-ctext-wrap">';
                if (!empty(data.messages) && !empty(data.messages.message_file)) {
                    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff', '.svg', '.ico'];
                    const videoExtensions = ['.mp4', '.mov', '.avi', '.wmv', '.mkv', '.flv', '.webm', '.mpeg', '.3gp', '.mpg'];
                    const fileExtension = data.messages.message_file.substr(data.messages.message_file.lastIndexOf('.'));
                    if (imageExtensions.includes(fileExtension.toLowerCase())) {
                        html += '<div class="messenger-img messenger-mb-0">\n' +
                            '        <div class="messenger-img-list">\n' +
                            '            <div>\n' +
                            '                <a class="messenger-popup-img messenger-d-inline-block" href="#!">\n' +
                            '                    <img src="' + data.messages.message_file + '" alt="" class="messenger-rounded messenger-border messenger-img-thumbnail">\n' +
                            '                </a>\n' +
                            '            </div>\n' +
                            '            <div class="messenger-img-link">\n' +
                            '                <ul class="messenger-list-inline messenger-mb-0">\n' +
                            '                    <li class="messenger-list-inline-item messenger-dropdown">\n' +
                            '                        <a class="messenger-dropdown-toggle" href="#" role="button"\n' +
                            '                           data-bs-toggle="messenger-dropdown" aria-haspopup="true" aria-expanded="false">\n' +
                            '                            <i class="bx bx-dots-horizontal-rounded"></i>' +
                            '                        </a>\n' +
                            '                        <div class="messenger-dropdown-menu">\n' +
                            '                            <a class="messenger-dropdown-item messenger-d-flex messenger-align-items-center messenger-justify-content-between delete-message" id="delete_' + data.messages.id + '" href="#">\n' +
                            '                                Delete\n' +
                            '                                <i class="bx bx-trash messenger-ms-2 messenger-text-muted"></i>\n' +
                            '                            </a>\n' +
                            '                        </div>\n' +
                            '                    </li>\n' +
                            '                </ul>\n' +
                            '            </div>\n' +
                            '        </div>\n' +
                            '    </div>';
                    } else if (videoExtensions.includes(fileExtension.toLowerCase())) {
                        html += '<div class="messenger-img messenger-mb-0">\n' +
                            '        <div class="messenger-img-list">\n' +
                            '           <div>\n' +
                            '               <video controls class="messenger-rounded messenger-border messenger-video-thumbnail" style="width: 300px !important;">\n' +
                            '                   <source src="' + data.messages.message_file + '" type="video/mp4">\n' +
                            '                   Your browser does not support the video tag.\n' +
                            '               </video>\n' +
                            '           </div>' +
                            '            <div class="messenger-img-link">\n' +
                            '                <ul class="messenger-list-inline messenger-mb-0">\n' +
                            '                    <li class="messenger-list-inline-item messenger-dropdown">\n' +
                            '                        <a class="messenger-dropdown-toggle" href="#" role="button"\n' +
                            '                           data-bs-toggle="messenger-dropdown" aria-haspopup="true" aria-expanded="false">\n' +
                            '                            <i class="bx bx-dots-horizontal-rounded"></i>' +
                            '                        </a>\n' +
                            '                        <div class="messenger-dropdown-menu">\n' +
                            '                            <a class="messenger-dropdown-item messenger-d-flex messenger-align-items-center messenger-justify-content-between delete-message" id="delete_' + data.messages.id + '" href="#">\n' +
                            '                                Delete\n' +
                            '                                <i class="bx bx-trash messenger-ms-2 messenger-text-muted"></i>\n' +
                            '                            </a>\n' +
                            '                        </div>\n' +
                            '                    </li>\n' +
                            '                </ul>\n' +
                            '            </div>\n' +
                            '        </div>\n' +
                            '    </div>';
                    } else {
                        html += '<div class="messenger-ctext-wrap-content">\n' +
                            '        <div class="messenger-p-3 ' + border + ' messenger-rounded-3">\n' +
                            '            <div class="messenger-d-flex messenger-align-items-center messenger-attached-file">\n' +
                            '                <div class="messenger-flex-shrink-0 messenger-avatar-sm messenger-me-3 messenger-ms-0 messenger-attached-file-avatar">\n' +
                            '                    <div class="messenger-avatar-title ' + bgSoftLight + ' messenger-rounded-circle messenger-fs-20">\n' +
                            '                        <i class="' + getFileIcon(data.messages.file_type) + '"></i>\n' +
                            '                    </div>\n' +
                            '                </div>\n' +
                            '                <div class="messenger-flex-grow-1 messenger-overflow-hidden">\n' +
                            '                    <div class="messenger-text-start">\n' +
                            '                        <h5 class="messenger-fs-14 ' + messageTextClass + ' messenger-mb-1">' + data.messages.file_original_name + '</h5>\n' +
                            '                        <p class="' + messageTextClass + ' messenger-text-truncate messenger-fs-13 messenger-mb-0">' + data.messages.file_size + '</p>\n' +
                            '                    </div>\n' +
                            '                </div>\n' +
                            '                <div class="messenger-flex-shrink-0 messenger-ms-4">\n' +
                            '                    <div class="messenger-d-flex messenger-gap-2 messenger-fs-20 messenger-d-flex messenger-align-items-start">\n' +
                            '                        <div>\n' +
                            '                            <a href="' + data.messages.message_file + '" download class="' + messageTextClass + '">\n' +
                            '                                <i class="bx bxs-download"></i>\n' +
                            '                            </a>\n' +
                            '                        </div>\n' +
                            '                    </div>\n' +
                            '                </div>\n' +
                            '            </div>\n' +
                            '        </div>\n' +
                            '    </div>' +
                            '    <div class="messenger-img-link">\n' +
                            '        <ul class="messenger-list-inline messenger-mb-0">\n' +
                            '            <li class="messenger-list-inline-item messenger-dropdown">\n' +
                            '                <a class="messenger-dropdown-toggle" href="#" role="button"\n' +
                            '                   data-bs-toggle="messenger-dropdown" aria-haspopup="true"\n' +
                            '                   aria-expanded="false">\n' +
                            '                    <i class="bx bx-dots-horizontal-rounded"></i> </a>\n' +
                            '                <div class="messenger-dropdown-menu">\n' +
                            '                    <a class="messenger-dropdown-item messenger-d-flex messenger-align-items-center messenger-justify-content-between"\n' +
                            '                       href="' + data.messages.message_file + '" download>\n' +
                            '                        Download\n' +
                            '                        <i class="bx bx-download messenger-ms-2 messenger-text-muted"></i>\n' +
                            '                    </a>\n' +
                            '                    <a class="messenger-dropdown-item messenger-d-flex messenger-align-items-center messenger-justify-content-between delete-message"\n' +
                            '                       id="delete_' + data.messages.id + '" href="#">\n' +
                            '                        Delete\n' +
                            '                        <i class="bx bx-trash messenger-ms-2 messenger-text-muted"></i>\n' +
                            '                    </a>\n' +
                            '                </div>\n' +
                            '            </li>\n' +
                            '        </ul>\n' +
                            '    </div>';
                    }
                } else {
                    html += '<div class="messenger-ctext-wrap-content">\n' +
                        '        <p class="messenger-mb-0 messenger-ctext-content ' + messageTextClass + '">' + data.messages.message + '</p>\n' +
                        '    </div>\n' +
                        '    <div class="messenger-align-self-start messenger-box-drop messenger-d-flex">\n' +
                        '        <div class="messenger-dropdown">\n' +
                        '            <a class="messenger-dropdown-toggle" href="#" role="button"\n' +
                        '               data-bs-toggle="messenger-dropdown" aria-haspopup="true"\n' +
                        '               aria-expanded="false">\n' +
                        '                <i class="ri-more-2-fill"></i>\n' +
                        '            </a>\n' +
                        '            <div class="messenger-dropdown-menu">\n' +
                        '                <a class="messenger-dropdown-item messenger-d-flex messenger-align-items-center messenger-justify-content-between messenger-reply-message"\n' +
                        '                   href="#" id="reply-message-0"\n' +
                        '                   data-bs-toggle="collapse"\n' +
                        '                   data-bs-target=".replyCollapse">Reply\n' +
                        '                    <i class="bx bx-share messenger-ms-2 messenger-text-muted"></i>\n' +
                        '                </a>\n' +
                        '                <a class="messenger-dropdown-item messenger-d-flex messenger-align-items-center messenger-justify-content-between delete-message" id="delete_' + data.messages.id + '" \n' +
                        '                   href="#">Delete\n' +
                        '                    <i class="bx bx-trash messenger-text-muted messenger-ms-2"></i>\n' +
                        '                </a>\n' +
                        '            </div>\n' +
                        '        </div>\n' +
                        '    </div>';
                }
                html += '</div>\n' +
                    '            <div class="messenger-conversation-name">\n' +
                    '                <small class="messenger-text-muted messenger-time">' + data.messages.message_time + '</small>\n' +
                    '                <span class="messenger-text-success messenger-check-message-icon">\n' +
                    '                    <i class="bx bx-check-double"></i>\n' +
                    '                </span>\n' +
                    '            </div>\n' +
                    '        </div>\n' +
                    '    </div>\n' +
                    '</li>';
            }
        }
        $('#users-conversation').append(html);

        const e = document.querySelector("#chat-conversation .messenger-simplebar-content-wrapper");
        e.scrollTop = e.scrollHeight;
        if (!document.hidden) {
            makeSeen();
        }
    });

    channel.bind('pusher:subscription_succeeded', function (members) {
        console.log("subscription_succeeded");
        console.log(members);
        // 'members' contains information about users currently subscribed to the channel
        // members.each(function(member) {
        //     console.log(member.info.user_id + ' is online');
        //     // Update UI to indicate online status for this user
        // });
    });

    channel.bind('pusher:member_removed', function (member) {
        console.log("member_removed");
        console.log(members);
        console.log(member.info.user_id + ' is offline');
        // Update UI to indicate offline status for this user
    });
}

function makeSeen() {
    const formData = {
        '_token': messenger.token,
        receiver_id: messenger.receiverId
    };
    $.ajax({
        url: messenger.makeSeen,
        type: "POST",
        data: formData,
        success: function (response) {
            console.log(response);
        },
        error: function (error) {
            console.log(error);
        }
    })
}

/**
 * Delete single message
 */
$(document).on('click', '.delete-message', function () {
    const messageId = $(this).attr('id').split('_')[1];
    deleteChat({messageId: messageId});
});

/**
 * Delete whole conversation
 */
$(document).on('click', '.delete-conversation', function () {
    const chatId = $(this).attr('id').split('_')[1];
    deleteChat({messageId: '', chatId: chatId});
});

/**
 * Delete chat
 *
 * @param parameters
 */
function deleteChat(parameters) {
    let {messageId, chatId} = parameters;
    const formData = {
        '_token': messenger.token,
        id: messageId,
        chat_id: chatId,
    };
    $.ajax({
        url: messenger.deleteMessageRoute,
        type: "DELETE",
        data: formData,
        success: function (response) {
            if (response.success) {
                if (!empty(messageId)) {
                    $('#message_' + messageId).remove();
                }
                if (!empty(chatId)) {
                    $('#user-chat_' + chatId).remove();
                    $('#conversation-main').addClass('messenger-d-none').removeClass('messenger-d-block messenger-user-chat-show');
                }
                console.log(response);
            }
        }
    })
}

/**
 * use to get data for any GET ajax call
 *
 * @param url
 * @param formData
 */
function getData(url, formData = {}) {
    let data;
    $.ajax({
        url: url,
        type: 'GET',
        async: false,
        data: formData,
        success(response) {
            data = response;
        },
        error(error) {
            let message = error.statusText;
            if (!empty(error.responseJSON)) {
                message = error.responseJSON.message;
            }
            alert(message);
        }
    });

    return data;
}

/**
 * Check empty value
 *
 * @param value
 * @returns {boolean}
 */
function empty(value) {
    if (value === null || value === 'null' || value === undefined) {
        return true;
    }
    if (typeof value === 'string' && value.trim() === '') {
        return true;
    }
    if (typeof value === 'number' && value === 0) {
        return true;
    }
    if (Array.isArray(value) && value.length === 0) {
        return true;
    }
    if (typeof value === 'object' && Object.keys(value).length === 0) {
        return true;
    }
    if (typeof value === "boolean" && value === false) {
        return true;
    }

    return false;
}
