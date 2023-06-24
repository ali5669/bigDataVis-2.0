// Make the draggable elements resizable
$('.draggable').resizable({
    handles: 'se',
    autoHide: true
});

// Make the draggable elements draggable
$('.draggable').draggable({
    handle: '.draggable-handle',
    containment: 'parent'
});