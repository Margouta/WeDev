<script>
	import { onMount } from 'svelte';

	let displayText = '';
	let currentIndex = 0;
	let isDeleting = false;
	let textIndex = 0;
	let isTyping = true;

	const texts = [
		'plus efficaces',
		'mieux organisés',
		'vraiment collaboratifs',
		'toujours accessibles',
        'sans retards'
	];

	const typingSpeed = 100;
	const deletingSpeed = 50;
	const pauseDuration = 2000;

	onMount(() => {
		const type = () => {
			if (!isTyping) return;

			const currentText = texts[textIndex];

			if (!isDeleting) {
				if (currentIndex < currentText.length) {
					displayText += currentText[currentIndex];
					currentIndex++;
					setTimeout(type, typingSpeed);
				} else {
					setTimeout(() => {
						isDeleting = true;
						type();
					}, pauseDuration);
				}
			} else {
				if (currentIndex > 0) {
					displayText = currentText.substring(0, currentIndex - 1);
					currentIndex--;
					setTimeout(type, deletingSpeed);
				} else {
					isDeleting = false;
					textIndex = (textIndex + 1) % texts.length;
					setTimeout(type, 500);
				}
			}
		};

		type();

		return () => {
			isTyping = false;
		};
	});
</script>

<span id="typed">{displayText}</span>
<span class="typed-cursor typed-cursor--blink" aria-hidden="true">|</span>

<style>
	.typed-cursor {
		animation: blink 0.7s infinite;
	}

	.typed-cursor--blink {
		animation: blink 0.7s infinite;
	}

	@keyframes blink {
		0% {
			opacity: 1;
		}
		50% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}
</style>
