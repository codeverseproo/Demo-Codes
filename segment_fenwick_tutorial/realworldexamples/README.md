
🔍 Watch the output:  
- The **sum of readings** in the sliding window updates in real time.  
- A **warning is printed** the moment an anomalous spike is introduced.

---

## 3. High-Frequency Trading: When Microseconds Matter

In finance, **speed isn’t just an advantage — it's everything**.  
A **millisecond delay** can cost **millions**.

Trading platforms need to analyze their **order books** — the list of buy and sell orders at different prices — in real time.  
A common question:  
> *"What's the total volume of buy orders up to a price of $100.12?"*

A **Fenwick Tree** answers this instantly.  
Each price point is an **index** in the tree.  
When a new order comes in or gets canceled, it’s just a **single, lightning-fast update**.

This script shows how an **order book can be managed** with this approach.

### How to Run

```python
python hft_demo.py
```


The output shows how the **total volume up to a specific price point** changes instantly with each new or canceled order.  

⏱ *Exactly how high-frequency trading systems work.*

---

## 4. Social Media: Finding What's Hot and Where

How does a platform like **X (formerly Twitter)** know that a specific topic is **trending in your city**?

They’re analyzing **two axes at once**:  
- Topic  
- Location  

This is a perfect use case for a **2D Fenwick Tree**.  
Think of it as a **grid**.  

- You can **update the engagement count** for a specific cell (e.g., `"Tech"` in `"New York"`)  
- And then **instantly query** the total engagement for an entire rectangular region (e.g., the entire *West Coast*).  

I’ve seen teams get a **25x speedup** on these kinds of queries.

### How to Run

```python 
python social_media_demo.py
```


You’ll see:  
- A query for a **specific region**  
- A **viral spike** in another region  
- A re-query showing that the **original region’s total is unaffected**  

All in **milliseconds**.

---

## 🚀 Why This Matters

Segment Trees and Fenwick Trees aren’t just textbook algorithms.  
They’re the **hidden engines** behind:  
- Flash sales on **Amazon**  
- Sensor monitoring in **factories**  
- Sub-millisecond trades on **Wall Street**  
- Trending detection on **social media**  

When **speed = money**, these data structures **win the game**.

