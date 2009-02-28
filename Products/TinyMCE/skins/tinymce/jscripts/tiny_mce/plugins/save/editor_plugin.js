/**
 * $Id: editor_plugin_src.js 609 2008-02-18 16:19:27Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright � 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	tinymce.create('tinymce.plugins.Save', {
		init : function(ed, url) {
			var t = this;

			t.editor = ed;

			// Register commands
			ed.addCommand('mceSave', function() {
				tinymce.util.XHR.send({
					url : ed.settings.document_url + '/tinymce-save',
					content_type : "application/x-www-form-urlencoded",
					type : "POST",
					data : "text=" + encodeURIComponent(ed.getContent()) + "&fieldname=" + ed.id,
					success : function( data, req, o ) {
						if (!tinymce.isIE) {
							tinymce.DOM.addClass(tinymce.DOM.get(ed.id + '_tbl'), 'mceEditorSave');
							window.setTimeout(function() {
								tinymce.DOM.removeClass(tinymce.DOM.get(ed.id + '_tbl'), 'mceEditorSave');
								tinymce.DOM.removeClass(tinymce.DOM.get(ed.id + '_tbl'), 'mceEditorFocus');
								tinymce.DOM.addClass(tinymce.DOM.get(ed.id + '_tbl'), 'mceEditorFocus');
							}, 500);
						}
						tinymce.DOM.add(document.body, 'div', {id: 'mceSaveMessage', 'class' : 'mceSaveMessage'}, 'Document saved.');
							window.setTimeout(function () {
							tinymce.DOM.remove('mceSaveMessage');
						}, 1000);
					}
				});
			});
				
			ed.addCommand('mceCancel', t._cancel);

			// Register buttons
			ed.addButton('save', {title : 'save.save_desc', cmd : 'mceSave'});
			ed.addButton('cancel', {title : 'save.cancel_desc', cmd : 'mceCancel'});

			// ed.onNodeChange.add(t._nodeChange, t);
			ed.addShortcut('ctrl+s', ed.getLang('save.save_desc'), 'mceSave');
		},

		getInfo : function() {
			return {
				longname : 'Save',
				author : 'Moxiecode Systems AB',
				authorurl : 'http://tinymce.moxiecode.com',
				infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/save',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		},

		// Private methods

		_nodeChange : function(ed, cm, n) {
			var ed = this.editor;

			if (ed.getParam('save_enablewhendirty')) {
				cm.setDisabled('save', !ed.isDirty());
				cm.setDisabled('cancel', !ed.isDirty());
			}
		},

		// Private methods

		_save : function() {
			var ed = this.editor, formObj, os, i, elementId;

			formObj = tinymce.DOM.get(ed.id).form || tinymce.DOM.getParent(ed.id, 'form');

			if (ed.getParam("save_enablewhendirty") && !ed.isDirty())
				return;

			tinyMCE.triggerSave();

			// Use callback instead
			if (os = ed.getParam("save_onsavecallback")) {
				if (ed.execCallback('save_onsavecallback', ed)) {
					ed.startContent = tinymce.trim(ed.getContent({format : 'raw'}));
					ed.nodeChanged();
				}

				return;
			}

			if (formObj) {
				ed.isNotDirty = true;

				if (formObj.onsubmit == null || formObj.onsubmit() != false)
					formObj.submit();

				ed.nodeChanged();
			} else
				ed.windowManager.alert("Error: No form element found.");

			return true;
		},

		_cancel : function() {
			var ed = this.editor, os, h = tinymce.trim(ed.startContent);

			// Use callback instead
			if (os = ed.getParam("save_oncancelcallback")) {
				ed.execCallback('save_oncancelcallback', ed);
				return;
			}

			ed.setContent(h);
			ed.undoManager.clear();
			ed.nodeChanged();
		}
	});

	// Register plugin
	tinymce.PluginManager.add('save', tinymce.plugins.Save);
})();