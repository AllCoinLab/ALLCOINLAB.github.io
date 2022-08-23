'use strict'

$('#modal').on('shown.bs.modal', function () {
  $('#modal').trigger('focus');
})
$('#modal-select-output').on('shown.bs.modal', function () {
  $('#modal-select-output').trigger('focus');
})
