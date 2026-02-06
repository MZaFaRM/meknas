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

function getDubaiNow() {
	return new Date(
		new Date().toLocaleString("en-US", { timeZone: "Asia/Dubai" }),
	);
}

function formatTime12(dateObj) {
	return new Intl.DateTimeFormat("en-US", {
		timeZone: "Asia/Dubai",
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
	}).format(dateObj);
}

function setBadge({ text, state }) {
	const badge = document.getElementById("hoursBadge");
	if (!badge) return;

	badge.textContent = text;

	badge.classList.remove("is-open", "is-closed", "is-soon");
	badge.classList.add(state);

	const card = document.getElementById("hoursCard");
	if (card) {
		card.classList.toggle(
			"is-open",
			state === "is-open" || state === "is-soon",
		);
	}
}

const TZ = "Asia/Dubai";

// business hours in Dubai time (minutes since midnight)
const SCHEDULE = {
	Mon: [
		{ from: 9 * 60, to: 14 * 60 },
		{ from: 16 * 60, to: 22 * 60 + 30 },
	],
	Tue: [
		{ from: 9 * 60, to: 14 * 60 },
		{ from: 16 * 60, to: 22 * 60 + 30 },
	],
	Wed: [
		{ from: 9 * 60, to: 14 * 60 },
		{ from: 16 * 60, to: 22 * 60 + 30 },
	],
	Thu: [
		{ from: 9 * 60, to: 14 * 60 },
		{ from: 16 * 60, to: 22 * 60 + 30 },
	],
	Fri: [
		{ from: 9 * 60, to: 14 * 60 },
		{ from: 16 * 60, to: 22 * 60 + 30 },
	],
	Sat: [
		{ from: 9 * 60, to: 14 * 60 },
		{ from: 16 * 60, to: 22 * 60 + 30 },
	],
	Sun: [],
};

function getDubaiParts() {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone: TZ,
		weekday: "short",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	}).formatToParts(new Date());

	const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
	return {
		weekday: map.weekday, // "Mon"
		hour: Number(map.hour), // 0-23
		minute: Number(map.minute), // 0-59
	};
}

function formatMinutes12(mins) {
	let h = Math.floor(mins / 60);
	const m = mins % 60;
	const ampm = h >= 12 ? "PM" : "AM";
	h = h % 12;
	if (h === 0) h = 12;
	return `${h}:${String(m).padStart(2, "0")} ${ampm}`;
}

function setBadge({ text, state }) {
	const badge = document.getElementById("hoursBadge");
	if (!badge) return;

	badge.textContent = text;
	badge.classList.remove("is-open", "is-closed", "is-soon");
	badge.classList.add(state);

	const card = document.getElementById("hoursCard");
	if (card)
		card.classList.toggle(
			"is-open",
			state === "is-open" || state === "is-soon",
		);
}

function updateBusinessHoursBadge() {
	const params = new URLSearchParams(location.search);

	let { weekday, hour, minute } = getDubaiParts();

	const slots = SCHEDULE[weekday] || [];
	const nowMins = hour * 60 + minute;

	// Closed today
	if (!slots.length) {
		setBadge({ text: "Closed", state: "is-closed" });
		return;
	}

	// Open now?
	const currentSlot = slots.find((s) => nowMins >= s.from && nowMins < s.to);
	if (currentSlot) {
		const minsLeft = currentSlot.to - nowMins;
		if (minsLeft <= 30) {
			setBadge({
				text: `Closing Soon • ${formatMinutes12(currentSlot.to)}`,
				state: "is-soon",
			});
			return;
		}

		setBadge({
			text: `Open • Closes ${formatMinutes12(currentSlot.to)}`,
			state: "is-open",
		});
		return;
	}

	// Next opening today?
	const nextSlot = slots.find((s) => nowMins < s.from);
	if (nextSlot) {
		const minsUntil = nextSlot.from - nowMins;
		if (minsUntil <= 30) {
			setBadge({
				text: `Opening Soon • ${formatMinutes12(nextSlot.from)}`,
				state: "is-soon",
			});
			return;
		}

		setBadge({
			text: `Closed • Opens ${formatMinutes12(nextSlot.from)}`,
			state: "is-closed",
		});
		return;
	}

	// After last slot
	setBadge({
		text: "Closed • Opens Tomorrow 9:00 AM",
		state: "is-closed",
	});
}

updateBusinessHoursBadge();
setInterval(updateBusinessHoursBadge, 30000);

document.querySelectorAll(".service-card").forEach((card) => {
	const titleEl = card.querySelector(".service-card__title");
	const btn = card.querySelector(".service-card__btn");

	if (!titleEl || !btn) return;

	const serviceTitle = titleEl.textContent.trim();
	const message = `Hi MEKNAS Businessman Services, I want to know more about the ${serviceTitle} you provide at your service center.`;

	const url = `https://wa.me/971522006970?text=${encodeURIComponent(
		message,
	)}`;

	const link = document.createElement("a");
	link.className = btn.className;
	link.href = url;
	link.target = "_blank";
	link.rel = "noopener";

	link.innerHTML = btn.innerHTML;

	btn.replaceWith(link);
});
