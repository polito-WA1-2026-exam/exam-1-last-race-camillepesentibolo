import React, { useState, useEffect } from 'react';
import { Container, Table, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router';

import dayjs from 'dayjs';
import 'bootstrap-icons/font/bootstrap-icons.css';
import {getRanking } from '../api/api.js'; 

function RankingView() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchRankingData() {
      try {
        const data = await getRanking();
        setRanking(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load your scores at the moment.");
        setLoading(false);
      }
    }

    fetchRankingData();
  }, []);

  return (
    <Container className="mt-5">
      
          <div className="mb-4 text-center">
            <h1 style={{ 
              color: '#212529',
              margin: '10px 0', 
              fontSize: '2.5rem',
              fontWeight: '600',
              fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif'
            }}>
              Top Scores
            </h1>
          </div>

          {loading && (
            <div className="text-center my-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Loading your scores...</p>
            </div>
          )}

          {error && (
            <Alert variant="danger" className="my-3">
              {error}
            </Alert>
          )}

          {!loading && !error && (
            <Table striped bordered hover responsive className="align-middle text-center">
              <thead className="table-dark">
                <tr>
                  <th style={{ width: '15%' }}>Rankings</th>
                  <th style={{ width: '25%' }}>Score Achieved (Coins)</th>
                  <th style={{ width: '25%' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {ranking.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-muted py-4">
                      You haven't recorded any completed games yet
                    </td>
                  </tr>
                ) : (
                  ranking.map((row, index) => (
                    <tr key={index}>
                      <td>
                        {index === 0 ? '1st' : index === 1 ? '2nd' : index === 2 ? '3rd' : `${index + 1}th`}
                      </td>
                      <td>
                        <span className="fw-bold fs-6 bg-warning bg-opacity-50 p-2 rounded d-inline-block">
                          {row.bestScore} <i className="bi bi-coin" style={{ color: 'black' }}></i>
                        </span>
                      </td>
                      <td>
                        {row.startTime && row.startTime > 0 ? dayjs(row.startTime).format('DD/MM/YYYY [-] HH:mm') : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        
    </Container>
  );
}

export default RankingView;
