// src/components/TestResultForm.jsx
import React, { useState } from 'react';
import axios from 'axios';

const TestResultForm = ({ token, onSuccess }) => {
  const [category, setCategory] = useState('');
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/test_results/',
        {
          category,
          correct_answers: correctAnswers,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      onSuccess(response.data);
      setCategory('');
      setCorrectAnswers(0);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || 'テスト結果の送信に失敗しました。'
      );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>カテゴリ:</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">選択してください</option>
          <option value="Tech">Tech</option>
          <option value="Biz">Biz</option>
          <option value="Design">Design</option>
        </select>
      </div>
      <div>
        <label>正解数:</label>
        <input
          type="number"
          value={correctAnswers}
          onChange={(e) => setCorrectAnswers(parseInt(e.target.value))}
          min="0"
          required
        />
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit">送信</button>
    </form>
  );
};

export default TestResultForm;
