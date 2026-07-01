"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { submitFeedback, type FeedbackFormState } from "./actions";

const initialFeedbackState: FeedbackFormState = { status: "idle" };
const FACEBOOK_POST_URL = "https://www.facebook.com/share/p/1Bez7Xz8DS/";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="submit-btn" disabled={pending}>
      {pending ? "Submitting…" : "Submit Review"}
    </button>
  );
}

export default function Home() {
  const products = [
    { id: "french_fry", name: "FRENCH FRY", image: "/products/ff.png" },
    { id: "curly_fries", name: "CURLY FRIES", image: "/products/cf.png" },
    {
      id: "cheesy_potato_balls",
      name: "CHEESY POTATO BALLS",
      image: "/products/chb.png",
    },
    { id: "smilies", name: "SMILIES", image: "/products/sm.png" },
  ];
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [state, formAction] = useActionState(submitFeedback, initialFeedbackState);
  const formRef = useRef<HTMLFormElement>(null);
  const [handledStatus, setHandledStatus] = useState(state.status);
  const popupRef = useRef<Window | null>(null);
  const [popupBlocked, setPopupBlocked] = useState(false);

  if (state.status !== handledStatus) {
    setHandledStatus(state.status);
    if (state.status === "success") {
      setSelectedProducts([]);
      setRatings({});
    }
  }

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.location.href = FACEBOOK_POST_URL;
        popupRef.current.focus();
      }
    } else if (state.status === "error") {
      popupRef.current?.close();
    }
  }, [state.status]);

  const handleFormSubmit = () => {
    // Reserve a tab synchronously (within the click's user-gesture context) so
    // browsers don't block it once we navigate it after the async submission finishes.
    const popup = window.open("", "_blank");
    popupRef.current = popup;
    setPopupBlocked(!popup);
  };

  const toggleProduct = (productId: string) => {
    setSelectedProducts((previous) =>
      previous.includes(productId)
        ? previous.filter((id) => id !== productId)
        : [...previous, productId]
    );
  };

  const setProductRating = (productId: string, rating: number) => {
    setRatings((previous) => ({ ...previous, [productId]: rating }));
  };

  return (
    <div className="event-page">
      <div className="event-bg-pattern" aria-hidden="true" />
      <main className="event-main">
        <section className="brand-lockup" aria-label="Event brands">
          <Image
            src="/alimento.png"
            alt="Alimento"
            width={172}
            height={74}
            priority
            className="brand-logo"
          />
          <span className="brand-cross" aria-hidden="true">
            ×
          </span>
          <Image
            src="/gloryfry.png"
            alt="Gloryfry"
            width={172}
            height={74}
            priority
            className="brand-logo"
          />
        </section>

        <section className="hero-copy">
          <p className="hero-kicker">Taste. Feel. Review.</p>
          <h1 className="hero-title">Your Bite Powers Our Next Big Flavor</h1>
          <p className="hero-text">
            You are at the center of this campaign. Taste your favorite sample,
            pick the product you tried, and drop your quick feedback.
          </p>
        </section>

        <section className="form-wrap" aria-labelledby="form-heading">
          <h2 id="form-heading" className="form-heading">
            Event Feedback Form
          </h2>
          <form
            className="event-form"
            action={formAction}
            ref={formRef}
            onSubmit={handleFormSubmit}
          >
            <div className="field-group">
              <label htmlFor="name">Name</label>
              <input id="name" name="name" type="text" required />
            </div>

            <div className="field-group">
              <label htmlFor="phone">Phone</label>
              <input id="phone" name="phone" type="tel" required />
            </div>

            <div className="field-group">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" />
            </div>

            <fieldset className="products-group">
              <legend>Which product did you taste?</legend>
              <div className="product-box-grid">
                {products.map((product) => {
                  const isSelected = selectedProducts.includes(product.id);
                  const rating = ratings[product.id] ?? 0;
                  const checkboxId = `product-${product.id}`;

                  return (
                    <article
                      key={product.id}
                      className={`product-box ${isSelected ? "is-selected" : ""}`}
                    >
                      <input
                        id={checkboxId}
                        className="product-toggle"
                        type="checkbox"
                        name="products"
                        value={product.name}
                        checked={isSelected}
                        onChange={() => toggleProduct(product.id)}
                      />

                      <label htmlFor={checkboxId} className="product-photo-trigger">
                        <div className="product-photo" style={{ position: "relative" }}>
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            loading="eager"
                            sizes="(max-width: 768px) 45vw, 260px"
                            className="product-photo-image"
                          />
                        </div>
                      </label>

                      <label htmlFor={checkboxId} className="product-checkline">
                        <span className="product-checkbox-icon" aria-hidden="true" />
                        <span className="product-name">{product.name}</span>
                      </label>

                      <div className="rating-wrap" aria-hidden={!isSelected}>
                        <div
                          className="rating-stars"
                          role="radiogroup"
                          aria-label={`${product.name} rating`}
                        >
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              role="radio"
                              aria-checked={rating === star}
                              className={`star-btn ${star <= rating ? "is-on" : ""}`}
                              onClick={() => setProductRating(product.id, star)}
                            >
                              ★
                            </button>
                          ))}
                        </div>

                        <input
                          type="hidden"
                          name={`rating_${product.id}`}
                          value={isSelected ? rating : ""}
                        />
                      </div>
                    </article>
                  );
                })}
              </div>
            </fieldset>

            {state.status !== "idle" && (
              <p
                className={`form-status ${
                  state.status === "success" ? "is-success" : "is-error"
                }`}
                role="status"
                aria-live="polite"
              >
                {state.message}
              </p>
            )}

            {state.status === "success" && popupBlocked && (
              <a
                href={FACEBOOK_POST_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="fb-fallback-link"
              >
                Open our Facebook post
              </a>
            )}

            <SubmitButton />
          </form>
        </section>
      </main>

      <footer className="event-footer">
        <div className="footer-logos" aria-label="Brand logos in footer">
          <Image
            src="/alimento.png"
            alt="Alimento"
            width={130}
            height={56}
            className="brand-logo"
          />
          <span className="brand-cross" aria-hidden="true">
            ×
          </span>
          <Image
            src="/gloryfry.png"
            alt="Gloryfry"
            width={130}
            height={56}
            className="brand-logo"
          />
        </div>

        <div className="footer-meta">
          <div className="social-row" aria-label="Social media links">
            <a href="#" aria-label="Instagram">
              Instagram
            </a>
            <a href="#" aria-label="Facebook">
              Facebook
            </a>
            <a href="#" aria-label="YouTube">
              YouTube
            </a>
          </div>
          <address>
            Alimento Foods and Gloryfry Experience Booth, City Expo Ground,
            Dhaka, Bangladesh
          </address>
        </div>
      </footer>
    </div>
  );
}
