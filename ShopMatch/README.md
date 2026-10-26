# ShopMatch — Product Recommendation System

ShopMatch is a data analysis and product recommendation project built using R and RStudio for college coursework. The goal was to explore an online retailer's purchase history, understand customer buying patterns, and test whether past purchases could help recommend other products.

## What the project covers

- Cleaning and preparing retail transaction data
- Exploring sales trends, popular products, and customer spending
- Running statistical tests on customer behaviour
- Logistic regression to predict purchase of a popular product
- Linear regression to estimate customer spending
- Item-based collaborative filtering using cosine similarity
- Comparing recommendations with popularity and random baselines

## Tools

R, RStudio, dplyr, tidyr, ggplot2, readr, readxl, and scales.

## Dataset

The project uses the UCI Online Retail dataset: https://archive.ics.uci.edu/dataset/352/online+retail

The dataset is not included here. Place `Online Retail.xlsx` beside `shopmatch.R` before running the script. The script can also use a compatible `data.csv` file.

## Run it

1. Install R and RStudio.
2. Download the dataset and place it in the project folder.
3. Open `shopmatch.R` in RStudio and click **Source**.
4. See generated charts and results in `outputs/`.
5. To rebuild the written report, open `ShopMatch_Report.Rmd` and knit it in RStudio.

## Results in the report

- Logistic regression ROC AUC: 0.734
- Linear regression test R-squared: 0.704
- Item-based collaborative filtering HitRate@10: 44.2%
- Popularity baseline HitRate@10: 21.1%

These figures are the results recorded in the accompanying report; results can vary with the data and execution environment.

## Limitations

The recommender relies on purchase history, so it has little information for new customers. It also models the 100 most popular products rather than the full catalogue.

## Contributors

Yuvraj and Sagar Raut

No license has been added yet.
