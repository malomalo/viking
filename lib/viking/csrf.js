// CSRF Support for Ajax Request
// -----------------------------

// Set a callback for all AJAX request to set the CSRF Token header
// if the meta tag is present.
jQuery(document).ajaxSend(function(event, xhr, settings) {
    var token = jQuery('meta[name="csrf-token"]').attr('content');
    if (token) { xhr.setRequestHeader('X-CSRF-Token', token); }
});