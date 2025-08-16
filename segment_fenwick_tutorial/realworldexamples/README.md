Stop Guessing. Start Answering.
Ever wonder how giants like Amazon or Netflix know what you want, right now?

It’s not magic. It’s data. But more importantly, it’s fast data. When you're processing millions of events a second, traditional databases can't keep up. They're too slow. The game is won by companies that can get answers in milliseconds, not minutes.

The secret? Specialized data structures.

This repository contains four simplified, runnable Python scripts. They're not just theory. They're a look under the hood at the exact tools—Segment Trees and Fenwick Trees—that power some of the biggest tech platforms in the world.

Each script is a self-contained demo. No complex setup. Just run them and see for yourself.

1. E-commerce: The Flash Sale Problem
Imagine you're running a flash sale. You need to apply a $10 discount to thousands of products in the "Electronics" category. At the same time, your CEO wants to know the total revenue from the "Home Goods" category.

How long does that take? If your answer is "a few minutes," you're losing money.

This is where a Segment Tree with Lazy Propagation comes in. It's designed for exactly this scenario: updating a huge range of items and querying another range at the same time. I once saw a team cut their query time from 30 seconds to under 500 milliseconds using this exact approach.

The reality? This changes everything.

How to Run ecommerce_demo.py
This script simulates applying a discount to a range of products and then instantly calculating the total sales. Run it from your terminal:

python ecommerce_demo.py

You'll see the total sales change instantly after the discount is applied, demonstrating how quickly these operations can be performed.

2. IoT: Catching Failures Before They Happen
Picture a factory floor with thousands of sensors. They're all streaming temperature data every second. If a machine starts to overheat, you need to know instantly. Not a minute later when it's already on fire.

Here's what most people miss: you don't need to store every single reading. You just need to know the sum of readings over a short, sliding window of time.

A Fenwick Tree is the perfect tool for this. It's ridiculously fast at updating a value and then calculating the total sum up to that point. This script simulates a 10-second sliding window and injects an anomaly to show how quickly it can be detected.

How to Run iot_demo.py
This script simulates a live stream of sensor data and flags when the sum of recent readings crosses a threshold.

python iot_demo.py

Watch the output. You'll see the sum of readings in the sliding window update in real time, and a warning will be printed the moment an anomalous spike is introduced.

3. High-Frequency Trading: When Microseconds Matter
In finance, speed isn't just an advantage; it's everything. A millisecond delay can cost millions.

Trading platforms need to analyze their order books—the list of buy and sell orders at different prices—in real time. A common question is: "What's the total volume of buy orders up to a price of $100.12?"

A Fenwick Tree answers this instantly. Each price point is an index in the tree. When a new order comes in or gets canceled, it's a single, lightning-fast update. This script shows how an order book can be managed with this approach.

How to Run hft_demo.py
This script demonstrates how an HFT system can track the cumulative volume of orders as they are placed and canceled.

python hft_demo.py

The output shows how the total volume up to a specific price point changes instantly with each new or canceled order.

4. Social Media: Finding What's Hot and Where
How does a platform like X (formerly Twitter) know that a specific topic is trending in your city?

They're analyzing data on two axes at once: topic and location. This is a perfect use case for a 2D Fenwick Tree. Think of it as a grid. You can update the engagement count for a specific cell (e.g., "Tech" in "New York") and then instantly query the total engagement for an entire rectangular region (e.g., the entire "West Coast").

This is a massive improvement over traditional methods. I've seen teams get a 25x speedup on these kinds of queries.

How to Run social_media_demo.py
This script simulates tracking engagement for a hashtag across a 4x4 grid of regions.

python social_media_demo.py

You'll see how the system can query a specific region, then see a viral spike happen in another region, and re-query to show that the original region's total is unaffected—all in milliseconds.