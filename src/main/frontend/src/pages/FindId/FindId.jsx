import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../../i18n.js';
import Header from '../../components/Header/Header.jsx';
import { FormContainer, Title, Form, InputGroup, Input, SubmitButton, Message } from '../../components/ui';

import { findIdByEmail } from '../../api/auth';

function FindId() {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [lang, setLang] = useState(i18n.language || 'ko');
  const [msgKey, setMsgKey] = useState('');
  const [msgColor, setMsgColor] = useState('');
  const [foundId, setFoundId] = useState('');

  const handleLangChange = e => {
    setLang(e.target.value);
    i18n.changeLanguage(e.target.value);
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!email.trim()) {
      setMsgKey('emailRequired');
      setMsgColor('red');
      setFoundId('');
      return;
    }

    try {
      const { success, data } = await findIdByEmail(email.trim());
      if (success) {
        setMsgKey('findIdResult');
        setMsgColor('green');
        setFoundId(data);
      } else {
        setMsgKey('emailNotFound');
        setMsgColor('red');
        setFoundId('');
      }
    } catch (err) {
      setMsgKey('networkError');
      setMsgColor('red');
      setFoundId('');
    }
  };

  return (
    <>
      <Header lang={lang} onLangChange={handleLangChange} />
      <FormContainer>
        <Title>{t('findId')}</Title>
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Input
              name="email"
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={e => { setEmail(e.target.value); setMsgKey(''); setFoundId(''); }}
            />
          </InputGroup>
          <SubmitButton type="submit">{t('findId')}</SubmitButton>
        </Form>
        {msgKey && (
          <Message color={msgColor}>
            {msgKey === 'findIdResult' ? t(msgKey, {id: foundId}) : t(msgKey)}
          </Message>
        )}
      </FormContainer>
    </>
  );
}

export default FindId; 