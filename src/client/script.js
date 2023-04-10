const AVATAR_STORAGE_KEY = "avatar";
{

	/**
	 *
	 * @type {HTMLInputElement}
	 */
	const input = document.getElementById("upload-file-input");
	/**
	 *
	 * @type {HTMLImageElement}
	 */
	const imagePreview = document.getElementById("image");
	/**
	 *
	 * @type {HTMLIFrameElement}
	 */
	const filePreview = document.getElementById("file-preview");

	/**
	 *
	 * @param file {File}
	 */
	const handleImages = ( file ) => {
		// option 1
		// preview.src = URL.createObjectURL(file);

		// option 2
		const reader = new FileReader();

		reader.addEventListener("load", ( event ) => {
			imagePreview.src = event.target.result;
		});

		reader.readAsDataURL(file);
	};

	input.addEventListener("change",
		/**
		 *
		 * @param {Event<HTMLInputElement>} e
		 */
		( e ) => {
			/**
			 * @type {File}
			 */
			const file = e.target.files[0];
			// or
			// const file = e.target.files.item(0);
			if ( file.type.includes("image") ) {
				handleImages(file);
			} else if ( file.type.includes("pdf") ) {
				filePreview.src = URL.createObjectURL(file);
			}

		});
}
{
	/**
	 *
	 * @type {HTMLInputElement}
	 */
	const input = document.getElementById("upload-image-input");
	/**
	 *
	 * @type {HTMLCanvasElement}
	 */
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");
	const MAX_WIDTH = 200;


	input.addEventListener("change",
		/**
		 * @param {Event<HTMLInputElement>} e
		 */
		async ( e ) => {
			/**
			 * @type {File}
			 */
			const file = e.target.files[0];

			const bitmap = await createImageBitmap(file);
			// to maintain aspect ratio
			const scale = MAX_WIDTH / bitmap.width;
			canvas.width = MAX_WIDTH;
			canvas.height = bitmap.height * scale;


			ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
			ctx.canvas.toBlob(async ( blob ) => {
					if ( !blob ) {
						console.error("Canvas is empty");
						return;
					}
					const formData = new FormData();
					formData.append("file", blob, file.name);
					const response = await fetch("http://localhost:8080/files/avatar/upload", {
						method: "POST",
						body: formData
					});

					if (!response.ok ) {
						throw new Error("Upload failed");
					}
					/**
					 *
					 * @type {{
					 *     url: string
					 * }}
					 */
					const data = await response.json();
					localStorage.setItem(AVATAR_STORAGE_KEY, data.url);
				},
				"image/png",
				0.75);
		});
}
{
	/**
	 *
	 * @type {HTMLDivElement}
	 */
	const avatarContainer = document.getElementById("avatar-container");
	/**
	 *
	 * @type {HTMLDivElement}
	 */
	const placeholderAvatar = document.getElementById("placeholder-avatar");
	/**
	 *
	 * @type {HTMLImageElement}
	 */
	const avatar = document.getElementById("avatar");
	const avatarURL = localStorage.getItem(AVATAR_STORAGE_KEY);

	if ( avatarURL ) {
		avatar.src = avatarURL;
		avatar.classList.remove("hidden");
		placeholderAvatar.classList.add("hidden");
	} else {
		placeholderAvatar.classList.remove("hidden");
		avatar.classList.add("hidden");
	}


}
