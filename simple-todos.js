var Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {

	Meteor.subscribe('tasks');

	Template.body.helpers({
		tasks: function () {
			if ( Session.get('hideCompleted') ) {
				return Tasks.find(
					{checked: {$ne: true}},
					{sort: {createdAt: -1}}
				);
			} else {
				return Tasks.find({}, {sort: {createdAt: -1}});
			};
		},

		incompleteCount: function () {
			return Tasks.find({checked: {$ne: true}}).count();
		}
	});

	Template.body.events({
		'change .hide-completed input': function (event) {
			Session.set('hideCompleted', event.target.checked);
		},

		'submit .new-task': function (event) {
			var text = event.target.text.value;

			Meteor.call('addTask', text);

			event.target.text.value = "";
			return false;
		}
	});

	Template.task.events({
		'click .toggle-checked': function () {
			Meteor.call('setChecked', this._id, ! this.checked);
		},
		'click .delete': function () {
			Meteor.call('deleteTask', this._id);
		}
	});

	Accounts.ui.config({
		passwordSignupFields: 'USERNAME_ONLY'
	});

}; // isClient


Meteor.methods({
	addTask: function (text) {
		if (! Meteor.userId()) {
			throw new Meteor.error('not-authorized');
		};

		Tasks.insert({
			text: text,
			createdAt: new Date(),
			owner: Meteor.userId(),
			username: Meteor.user().username
		});
	},
	deleteTask: function (taskId) {
		Tasks.remove(taskId);
	},
	setChecked: function (taskId, setChecked) {
		Tasks.update(taskId, { $set: { checked: setChecked } });
	}
});


if (Meteor.isServer) {
	Meteor.publish('tasks', function () {
		return Tasks.find();
	});
};
