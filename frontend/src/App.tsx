import React from 'react';
import styled from 'styled-components';

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background-color: #f5f5f5;
`;

const Header = styled.header`
  width: 100%;
  max-width: 1200px;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #333;
  font-size: 2.5rem;
  text-align: center;
`;

const Main = styled.main`
  width: 100%;
  max-width: 1200px;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

function App() {
  return (
    <AppContainer>
      <Header>
        <Title>DeFi Lending DApp</Title>
      </Header>
      <Main>
        <p>Welcome to DeFi Lending DApp! 🚀</p>
      </Main>
    </AppContainer>
  );
}

export default App;
