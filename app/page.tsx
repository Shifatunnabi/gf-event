"use client";

import { useState } from "react";
import Image from "next/image";

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
          <form className="event-form">
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

                      <label htmlFor={checkboxId} className="product-select-area">
                        <div className="product-photo">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 45vw, 260px"
                            className="product-photo-image"
                          />
                        </div>

                        <div className="product-checkline">
                          <span className="product-checkbox-icon" aria-hidden="true" />
                          <span className="product-name">{product.name}</span>
                        </div>
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

            <button type="submit" className="submit-btn">
              Submit Review
            </button>
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
