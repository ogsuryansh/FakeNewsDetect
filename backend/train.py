import os
import re
import pickle
import pandas as pd
import nltk
from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

# Step 1: Download NLTK Data
print("Downloading NLTK stopwords...")
nltk.download('stopwords')
port_stem = PorterStemmer()
stop_words = set(stopwords.words('english'))

def stemming(content):
    if not isinstance(content, str):
        return ""
    stemmed_content = re.sub('[^a-zA-Z]', ' ', content)
    stemmed_content = stemmed_content.lower()
    stemmed_content = stemmed_content.split()
    stemmed_content = [port_stem.stem(word) for word in stemmed_content if not word in stop_words]
    stemmed_content = ' '.join(stemmed_content)
    return stemmed_content

# Step 2: Load Dataset
dataset_dir = '/home/ubuntu-nishchay/Fake_newsDetection/dataset/archive'
fake_path = os.path.join(dataset_dir, 'fake.csv')
true_path = os.path.join(dataset_dir, 'true.csv')

if not os.path.exists(fake_path) or not os.path.exists(true_path):
    print(f"Error: Dataset files not found in {dataset_dir}.")
    exit(1)

print("Loading datasets...")
fake_df = pd.read_csv(fake_path)
true_df = pd.read_csv(true_path)

# Label data: 1 for fake, 0 for true
fake_df['label'] = 1
true_df['label'] = 0

# Bias Mitigation: Remove source information from true news
# The ISOT dataset true news usually starts with "City (Reuters) - "
print("Mitigating bias by removing news agency markers from real news...")
def remove_source(text):
    if not isinstance(text, str):
        return ""
    # Remove "City (Reuters) - " or similar at the start
    return re.sub(r'^.*?\(.*?\)\s*-\s*', '', text)

true_df['text'] = true_df['text'].apply(remove_source)

# Combine datasets
print("Combining fake and real news data...")
news_dataset = pd.concat([fake_df, true_df], axis=0).reset_index(drop=True)

# Fill null values
news_dataset = news_dataset.fillna('')

# Combine features (using title and text as there is no author field in this dataset)
print("Combining features (title + text)...")
news_dataset['content'] = news_dataset['title'] + ' ' + news_dataset['text']

# Apply stemming
# Using a sample if the dataset is too large, but for now we'll try full
# print("Applying stemming to a subset (20000 rows) for speed...")
# news_dataset = news_dataset.sample(20000, random_state=1).reset_index(drop=True)

print(f"Applying stemming to {len(news_dataset)} rows...")
news_dataset['content'] = news_dataset['content'].apply(stemming)

# Separate data and label
X = news_dataset['content'].values
Y = news_dataset['label'].values

# Vectorize
print("Vectorizing data...")
vectorizer = TfidfVectorizer()
vectorizer.fit(X)
X = vectorizer.transform(X)

# Split data
X_train, X_test, Y_train, Y_test = train_test_split(X, Y, test_size=0.2, stratify=Y, random_state=2)

# Train Model
print("Training Logistic Regression model...")
model = LogisticRegression(max_iter=1000)
model.fit(X_train, Y_train)

# Evaluate
X_train_prediction = model.predict(X_train)
training_data_accuracy = accuracy_score(X_train_prediction, Y_train)
print(f'Accuracy on training data: {training_data_accuracy:.4f}')

X_test_prediction = model.predict(X_test)
test_data_accuracy = accuracy_score(X_test_prediction, Y_test)
print(f'Accuracy on test data: {test_data_accuracy:.4f}')

# Save Models
print("Saving model and vectorizer...")
with open('/home/ubuntu-nishchay/Fake_newsDetection/backend/finalized_model.pkl', 'wb') as f:
    pickle.dump(model, f)

with open('/home/ubuntu-nishchay/Fake_newsDetection/backend/vectorizer.pkl', 'wb') as f:
    pickle.dump(vectorizer, f)

print("Success! finalized_model.pkl and vectorizer.pkl created.")
