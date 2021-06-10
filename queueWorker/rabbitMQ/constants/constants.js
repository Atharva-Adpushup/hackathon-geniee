var CONSTANTS = {
	BLOB_CONTAINER: {
		NAME: 'test'
	},
	MECHANISM_TYPE: {
		FILE_PATH: {
			CODE_NAME: 'filePath',
			METHOD_NAME: 'createBlockBlobFromLocalFile'
		},
		FILE_TEXT: {
			CODE_NAME: 'fileText',
			METHOD_NAME: 'createBlockBlobFromText'
		}
	},
	ERROR_MESSAGES: {
		BLOB: {
			CONNECT_ERROR: 'CLOUD_STORAGE_UPLOAD: Unable to connect to Blob service',
			CREATION_SUCCESSFUL: 'CLOUD_STORAGE_UPLOAD: Successfully created a Blob',
			ALREADY_EXIST: 'CLOUD_STORAGE_UPLOAD: Blob already exists'
		},
		DIRECTORY: {
			CONNECT_ERROR: 'CLOUD_STORAGE_UPLOAD: Unable to connect to Directory service',
			CREATION_SUCCESSFUL: 'CLOUD_STORAGE_UPLOAD: Successfully created a Directory',
			ALREADY_EXIST: 'CLOUD_STORAGE_UPLOAD: Directory already exists'
		},
		FILE: {
			CONNECT_ERROR: 'CLOUD_STORAGE_UPLOAD: Unable to connect to FileUpload service',
			CREATION_SUCCESSFUL: 'CLOUD_STORAGE_UPLOAD: Successfully uploaded a File',
			ALREADY_EXIST: 'CLOUD_STORAGE_UPLOAD: File already exists'
		},
		STORAGE_SERVICE: {
			CONNECT_ERROR: 'CLOUD_STORAGE_UPLOAD: Unable to connect to given Storage service'
		},
		RABBITMQ: {
			PUBLISHER: {
				CONNECT_ERROR: 'RABBITMQ.PUBLISHER: Unable to connect to RabbitMQ service'
			},
			CONSUMER: {
				CONNECT_ERROR: 'RABBITMQ.CONSUMER: Unable to connect to RabbitMQ service',
				EMPTY_MESSAGE: 'RABBITMQ.CONSUMER: Empty message received'
			}
		},
		MESSAGE: {
			INVALID_DATA: 'ADPUSHUP_APP.RABBITMQ.CONSUMER: Invalid Message consumer',
			CDN_SYNC_ERROR: 'Unable to sync file with cdn',
			UNSYNCED_SETUP: 'Unsynced ads in setup',
			SELECTIVE_ROLLOUT_ENABLED:
				'Selective Rollout is enabled. Terminating cdnSyncConsumer and forwarding syncing job to selectiveRollout queue'
		}
	},
	SUCCESS_MESSAGES: {
		RABBITMQ: {
			PUBLISHER: {
				MESSAGE_PUBLISHED: 'RABBITMQ.PUBLISHER: Successfully published data'
			},
			CONSUMER: {
				MESSAGE_RECEIVED: 'RABBITMQ.CONSUMER: Received message data'
			}
		}
	},
	STORAGE_SERVICE: {
		AMAZON_S3: 'AMAZON_S3',
		AZURE_STORAGE: 'AZURE_STORAGE'
	},
	CDN_SYNC_MAX_ATTEMPTS: 3
};

module.exports = CONSTANTS;
