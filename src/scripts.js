const burgerBtn = document.getElementById("burgerBtn");
const mobileMenu = document.getElementById("mobileMenu");

const closeMenu = () => mobileMenu.classList.remove("is-open");

burgerBtn.addEventListener("click", (e) => {
	e.stopPropagation();
	mobileMenu.classList.toggle("is-open");
});

mobileMenu.querySelectorAll("a").forEach((a) => {
	a.addEventListener("click", closeMenu);
});

document.addEventListener("click", (e) => {
	if (!mobileMenu.classList.contains("is-open")) return;
	if (mobileMenu.contains(e.target) || burgerBtn.contains(e.target)) return;
	closeMenu();
});

document.addEventListener("keydown", (e) => {
	if (e.key === "Escape") closeMenu();
});

document.querySelectorAll(".slider").forEach((slider) => {
	const track = slider.querySelector(".slider__track");
	const cards = [...slider.querySelectorAll(".service-card, .step-card")];

	const dots = slider.nextElementSibling?.classList.contains("slider-dots")
		? slider.nextElementSibling
		: null;

	const setActive = (target) => {
		cards.forEach((c) => c.classList.remove("is-active"));
		target.classList.add("is-active");

		if (dots) {
			const i = cards.indexOf(target);
			dots.querySelectorAll(".slider-dot").forEach((d, idx) => {
				d.classList.toggle("is-active", idx === i);
			});
		}
	};

	if (dots) {
		dots.innerHTML = cards
			.map(() => `<span class="slider-dot"></span>`)
			.join("");
	}

	let obs = null;

	const enableSliderFocus = () => {
		const ratios = new Map();

		obs = new IntersectionObserver(
			(entries) => {
				// Update stored ratios for changed entries
				entries.forEach((e) => {
					ratios.set(e.target, e.intersectionRatio);
				});

				// Build a list of all cards with their current ratio
				const all = cards
					.map((el) => ({
						target: el,
						intersectionRatio: ratios.get(el) ?? 0,
					}))
					.filter((e) => e.intersectionRatio > 0);

				if (!all.length) return;

				// Sort by most visible
				all.sort((a, b) => b.intersectionRatio - a.intersectionRatio);

				const best = all[0];
				const second = all[1];

				const bestRatio = best.intersectionRatio;
				const secondRatio = second ? second.intersectionRatio : 0;

				if (bestRatio - secondRatio < 0.5) return;
				if (secondRatio >= 0.5) return;

				// Also ensure best is reasonably visible
				if (bestRatio < 0.45) return;

				setActive(best.target);
			},
			{
				root: slider,
				threshold: [0, 0.1, 0.25, 0.35, 0.5, 0.65, 0.8, 1],
			},
		);

		cards.forEach((c) => obs.observe(c));
	};

	const disableSliderFocus = () => {
		if (!obs) return;
		obs.disconnect();
		obs = null;

		// clear active on desktop so only hover matters
		cards.forEach((c) => c.classList.remove("is-active"));
	};

	const updateMode = () => {
		const isScrollable = slider.scrollWidth > slider.clientWidth + 5;

		if (dots) dots.style.display = isScrollable ? "flex" : "none";

		if (isScrollable) {
			if (!obs) enableSliderFocus();
		} else {
			disableSliderFocus();
		}
	};

	// hover only (always ok, but matters mostly on desktop)
	cards.forEach((card) => {
		card.addEventListener("mouseenter", () => setActive(card));
		card.addEventListener("mouseleave", () => {
			// on desktop: remove active so hover decides
			if (!obs) card.classList.remove("is-active");
		});
	});

	// init + responsive
	updateMode();
	window.addEventListener("resize", updateMode);
});
