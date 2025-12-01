import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import {
  Trophy, TrendingUp, Award,
  Save, HelpCircle,
  Zap, Music, BookOpen, Target, Star
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import TabButtons, { HelpPanel } from '../ui/TabButtons';
import { HelpButton, AddButton, CancelButton, SaveButton } from '../ui/ButtonComponents';
import { FormInput, FormLabel, FormTextarea, FormSelect } from '../ui/FormComponents';
import useXPRulesStore from '../../store/useXPRulesStore';
import useRewardsConfigStore from '../../store/useRewardsConfigStore';
import useLevelStore from '../../store/useLevelStore';
import AchievementManager from './AchievementManager';
import AchievementCard from './AchievementCard';
import UniversalFormInline from './UniversalFormInline';

const GamificationManager = () => {
  const [activeTab, setActiveTab] = useState('xp-rules');
  const [achievements, setAchievements] = useState([]); // Dynamické achievements z DB

  // NOVÝ CRUD systém pro XP pravidla
  const rewards = useRewardsConfigStore((state) => state.rewards);
  const loadRewards = useRewardsConfigStore((state) => state.loadRewards);
  const createReward = useRewardsConfigStore((state) => state.createReward);
  const updateReward = useRewardsConfigStore((state) => state.updateReward);
  const deleteReward = useRewardsConfigStore((state) => state.deleteReward);
  const duplicateReward = useRewardsConfigStore((state) => state.duplicateReward);
  const rewardsLoading = useRewardsConfigStore((state) => state.loading);
  const rewardsError = useRewardsConfigStore((state) => state.error);

  // State pro CRUD formuláře
  const [editingRewardId, setEditingRewardId] = useState(null);
  const [isCreatingReward, setIsCreatingReward] = useState(false);
  const [rewardFormData, setRewardFormData] = useState({
    action_type: '',
    category: 'xp_rule',
    label: '',
    description: '',
    xp_value: 0,
    icon_type: 'Zap',
    icon_color: 'primary',
    display_order: 0,
    is_active: true
  });

  // Store pro základní XP pravidla (KEEP pro backward compatibility)
  const xpRules = useXPRulesStore((state) => state.xpRules);
  const saveXPRules = useXPRulesStore((state) => state.saveXPRules);
  const loadXPRules = useXPRulesStore((state) => state.loadXPRules);
  const xpRulesLoading = useXPRulesStore((state) => state.loading);
  const xpRulesError = useXPRulesStore((state) => state.error);

  // Local state pro editaci XP pravidel před uložením
  const [tempXPRules, setTempXPRules] = useState(xpRules);

  // Synchronizovat temp state když se načtou hodnoty ze store
  useEffect(() => {
    setTempXPRules(xpRules);
  }, [xpRules]);

  const [levelThresholds, setLevelThresholds] = useState([
    { level: 1, min_xp: 0, max_xp: 99, label: 'Začátečník' },
    { level: 2, min_xp: 100, max_xp: 249, label: 'Učedník' },
    { level: 3, min_xp: 250, max_xp: 499, label: 'Pokročilý' },
    { level: 4, min_xp: 500, max_xp: 999, label: 'Expert' },
    { level: 5, min_xp: 1000, max_xp: null, label: 'Mistr' }
  ]);
  const [showHelp, setShowHelp] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const tabs = [
    { id: 'xp-rules', label: 'XP Body', icon: Zap },
    { id: 'bonuses', label: 'Bonusy', icon: Trophy },
    { id: 'achievements-management', label: 'Odměny', icon: Award },
    { id: 'levels', label: 'Levely', icon: TrendingUp }
  ];

  useEffect(() => {
    if (activeTab === 'xp-rules') {
      fetchAchievements();
    }
  }, [activeTab]);

  // Načíst XP pravidla při mountování
  useEffect(() => {
    loadXPRules();
  }, [loadXPRules]);

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('piano_achievements')
        .select('id, title, description, icon_type, xp_reward')
        .order('id', { ascending: true });

      if (error) throw error;
      setAchievements(data || []);
    } catch (err) {
      console.error('Error fetching achievements:', err);
    }
  };

  const handleSaveXPRules = async () => {
    await saveXPRules(tempXPRules);
    if (!xpRulesError) {
      showSuccess('XP pravidla byla uložena');
    }
  };

  const handleSaveLevels = () => {
    showSuccess('Nastavení levelů bylo uloženo');
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // ============================================================================
  // NOVÉ CRUD FUNKCE PRO XP PRAVIDLA
  // ============================================================================

  // Načíst rewards podle aktivního tabu
  useEffect(() => {
    if (activeTab === 'xp-rules') {
      loadRewards('xp_rule');
    } else if (activeTab === 'bonuses') {
      loadRewards('quiz_bonus');
    }
  }, [activeTab, loadRewards]);

  // Vytvořit nové XP pravidlo
  const handleCreateReward = () => {
    setIsCreatingReward(true);
    setEditingRewardId(null);
    setRewardFormData({
      action_type: '',
      category: activeTab === 'bonuses' ? 'quiz_bonus' : 'xp_rule',
      label: '',
      description: '',
      xp_value: 0,
      icon_type: 'Zap',
      icon_color: 'primary',
      display_order: rewards.length + 1,
      is_active: true
    });
  };

  // Editovat XP pravidlo
  const handleEditReward = (reward) => {
    setEditingRewardId(reward.id);
    setIsCreatingReward(false);
    setRewardFormData({
      action_type: reward.action_type,
      category: reward.category,
      label: reward.label,
      description: reward.description || '',
      xp_value: reward.xp_value,
      icon_type: reward.icon_type || 'Zap',
      icon_color: reward.icon_color || 'primary',
      display_order: reward.display_order || 0,
      is_active: reward.is_active !== false
    });
  };

  // Uložit reward (create nebo update)
  const handleSaveReward = async () => {
    try {
      if (isCreatingReward) {
        await createReward(rewardFormData);
        showSuccess('XP pravidlo bylo vytvořeno');
      } else {
        await updateReward(editingRewardId, rewardFormData);
        showSuccess('XP pravidlo bylo aktualizováno');
      }
      handleCancelReward();
    } catch (error) {
      console.error('Error saving reward:', error);
    }
  };

  // Smazat reward
  const handleDeleteReward = async (id, label) => {
    if (!window.confirm(`Opravdu chcete smazat pravidlo "${label}"?`)) {
      return;
    }
    try {
      await deleteReward(id, false); // soft delete
      showSuccess('XP pravidlo bylo smazáno');
    } catch (error) {
      console.error('Error deleting reward:', error);
    }
  };

  // Duplikovat reward
  const handleDuplicateReward = async (reward) => {
    try {
      await duplicateReward(reward);
      showSuccess('XP pravidlo bylo zkopírováno');
    } catch (error) {
      console.error('Error duplicating reward:', error);
    }
  };

  // Zrušit editaci
  const handleCancelReward = () => {
    setIsCreatingReward(false);
    setEditingRewardId(null);
  };

  const isEditingReward = isCreatingReward || editingRewardId !== null;

  // Filtrované rewards podle kategorie
  const xpRuleRewards = rewards.filter(r => r.category === 'xp_rule');
  const bonusRewards = rewards.filter(r => r.category === 'quiz_bonus');

  return (
    <div className="card">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h2 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trophy size={24} color="var(--color-primary)" />
            Správa gamifikace
          </h2>

          <HelpButton onClick={() => setShowHelp(!showHelp)} isActive={showHelp} />
        </div>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              background: 'rgba(45, 91, 120, 0.1)',
              border: '2px solid var(--color-secondary)',
              borderRadius: 'var(--radius)',
              padding: '0.75rem 1.25rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              color: 'var(--color-secondary)',
              fontWeight: '500'
            }}
          >
            <Trophy size={20} />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Panel */}
      <HelpPanel
        isOpen={showHelp}
        title="Nápověda - Gamifikace"
        content={{
          tips: [
            'XP Pravidla: Nastavte kolik bodů uživatel získá za různé aktivity',
            'Levely: Definujte prahy XP pro jednotlivé levely a jejich názvy',
            'Žebříček: Přehled TOP 50 uživatelů podle celkového XP',
            'Statistiky: Celkové statistiky gamifikace'
          ]
        }}
      />

      {/* Tabs */}
      <div style={{ marginBottom: '2rem' }}>
        <TabButtons
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          options={{ layout: 'pill', size: 'sm' }}
        />
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {/* XP Rules Tab - NOVÝ CRUD SYSTÉM */}
        {activeTab === 'xp-rules' && (
          <div>
            {/* Header s Add tlačítkem */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={20} color="var(--color-primary)" />
                XP Pravidla
              </h3>
              {!isEditingReward && (
                <AddButton onClick={handleCreateReward} />
              )}
            </div>

            {/* Create formulář - pouze pro nové */}
            <AnimatePresence>
              {isCreatingReward && (
                <UniversalFormInline
                  type="xp_rule"
                  formData={rewardFormData}
                  onChange={setRewardFormData}
                  onSave={handleSaveReward}
                  onCancel={handleCancelReward}
                  isCreating={true}
                  loading={rewardsLoading}
                />
              )}
            </AnimatePresence>

            {/* Loading state */}
            {rewardsLoading && !isEditingReward && (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                Načítám XP pravidla...
              </div>
            )}

            {/* Error state */}
            {rewardsError && !isEditingReward && (
              <div style={{
                padding: '1rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius)',
                color: '#ef4444',
                marginBottom: '1rem'
              }}>
                Chyba: {rewardsError}
              </div>
            )}

            {/* Seznam karet */}
            {!rewardsLoading && xpRuleRewards.length > 0 && (
              <div style={{
                display: 'grid',
                gap: '1rem',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))'
              }}>
                {xpRuleRewards.map(reward => (
                  <React.Fragment key={reward.id}>
                    <AchievementCard
                      type="xp_rule"
                      data={reward}
                      onEdit={handleEditReward}
                      onDuplicate={handleDuplicateReward}
                      onDelete={handleDeleteReward}
                    />

                    {/* Inline editační formulář pod kartou */}
                    {editingRewardId === reward.id && !isCreatingReward && (
                      <UniversalFormInline
                        type="xp_rule"
                        formData={rewardFormData}
                        onChange={setRewardFormData}
                        onSave={handleSaveReward}
                        onCancel={handleCancelReward}
                        isCreating={false}
                        loading={rewardsLoading}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!rewardsLoading && xpRuleRewards.length === 0 && !isEditingReward && (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                background: 'rgba(45, 91, 120, 0.05)',
                borderRadius: 'var(--radius)',
                border: '2px dashed rgba(45, 91, 120, 0.2)'
              }}>
                <Zap size={48} color="var(--color-border)" style={{ margin: '0 auto 1rem' }} />
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                  Zatím nemáte žádná XP pravidla
                </p>
                <AddButton onClick={handleCreateReward} />
              </div>
            )}
          </div>
        )}

        {/* Bonuses Tab - NOVÝ CRUD SYSTÉM */}
        {activeTab === 'bonuses' && (
          <div>
            {/* Header s Add tlačítkem */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trophy size={20} color="var(--color-primary)" />
                Kvízové bonusy
              </h3>
              {!isEditingReward && (
                <AddButton onClick={handleCreateReward} />
              )}
            </div>

            {/* Create formulář - pouze pro nové */}
            <AnimatePresence>
              {isCreatingReward && (
                <UniversalFormInline
                  type="quiz_bonus"
                  formData={rewardFormData}
                  onChange={setRewardFormData}
                  onSave={handleSaveReward}
                  onCancel={handleCancelReward}
                  isCreating={true}
                  loading={rewardsLoading}
                />
              )}
            </AnimatePresence>

            {/* Loading state */}
            {rewardsLoading && !isEditingReward && (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                Načítám kvízové bonusy...
              </div>
            )}

            {/* Error state */}
            {rewardsError && !isEditingReward && (
              <div style={{
                padding: '1rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius)',
                color: '#ef4444',
                marginBottom: '1rem'
              }}>
                Chyba: {rewardsError}
              </div>
            )}

            {/* Seznam karet */}
            {!rewardsLoading && bonusRewards.length > 0 && (
              <div style={{
                display: 'grid',
                gap: '1rem',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))'
              }}>
                {bonusRewards.map(reward => (
                  <React.Fragment key={reward.id}>
                    <AchievementCard
                      type="quiz_bonus"
                      data={reward}
                      onEdit={handleEditReward}
                      onDuplicate={handleDuplicateReward}
                      onDelete={handleDeleteReward}
                    />

                    {/* Inline editační formulář pod kartou */}
                    {editingRewardId === reward.id && !isCreatingReward && (
                      <UniversalFormInline
                        type="quiz_bonus"
                        formData={rewardFormData}
                        onChange={setRewardFormData}
                        onSave={handleSaveReward}
                        onCancel={handleCancelReward}
                        isCreating={false}
                        loading={rewardsLoading}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!rewardsLoading && bonusRewards.length === 0 && !isEditingReward && (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                background: 'rgba(45, 91, 120, 0.05)',
                borderRadius: 'var(--radius)',
                border: '2px dashed rgba(45, 91, 120, 0.2)'
              }}>
                <Trophy size={48} color="var(--color-border)" style={{ margin: '0 auto 1rem' }} />
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                  Zatím nemáte žádné kvízové bonusy
                </p>
                <AddButton onClick={handleCreateReward} />
              </div>
            )}
          </div>
        )}


        {/* Achievements Management Tab - AchievementManager s CRUD */}
        {activeTab === 'achievements-management' && (
          <div>
            <AchievementManager />
          </div>
        )}

        {/* Levels Tab */}
        {activeTab === 'levels' && (
          <div>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} color="var(--color-primary)" />
              Nastavení levelů
            </h3>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {levelThresholds.map((level) => (
                <div key={level.level} className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                    <div style={{
                      background: 'linear-gradient(135deg, var(--color-secondary), var(--color-primary))',
                      color: 'white',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '1.25rem'
                    }}>
                      {level.level}
                    </div>
                    <h4 style={{ margin: 0 }}>Level {level.level}</h4>
                  </div>

                  <div style={{ display: 'grid', gap: '1rem' }}>
                    <div>
                      <FormLabel text="Název levelu" />
                      <FormInput
                        type="text"
                        value={level.label}
                        onChange={(e) => {
                          const updated = levelThresholds.map(l =>
                            l.level === level.level ? { ...l, label: e.target.value } : l
                          );
                          setLevelThresholds(updated);
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <FormLabel text="Minimální XP" />
                        <FormInput
                          type="number"
                          value={level.min_xp}
                          onChange={(e) => {
                            const updated = levelThresholds.map(l =>
                              l.level === level.level ? { ...l, min_xp: parseInt(e.target.value) || 0 } : l
                            );
                            setLevelThresholds(updated);
                          }}
                          min="0"
                        />
                      </div>

                      <div>
                        <FormLabel text="Maximální XP" />
                        <FormInput
                          type="number"
                          value={level.max_xp || ''}
                          onChange={(e) => {
                            const updated = levelThresholds.map(l =>
                              l.level === level.level ? { ...l, max_xp: e.target.value ? parseInt(e.target.value) : null } : l
                            );
                            setLevelThresholds(updated);
                          }}
                          min="0"
                          placeholder={level.max_xp === null ? 'Bez limitu' : ''}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveLevels}
              className="btn btn-primary"
              style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Save size={18} />
              Uložit nastavení levelů
            </motion.button>
          </div>
        )}

      </motion.div>
    </div>
  );
};

export default GamificationManager;
