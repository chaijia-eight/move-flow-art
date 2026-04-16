import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, Shield, Swords, ArrowLeft, Trophy, AlertTriangle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import Chessboard from "@/components/Chessboard";
import ConfettiBurst from "@/components/ConfettiBurst";
import { getOraclePositionById, getConverterPositions, getDefenderPositions } from "@/data/oracleData";
import { getEngine } from "@/lib/stockfishEngine";
import { Chess } from "chess.js";
import type { MoveCategory } from "@/data/openings";

export default function Oracle() {
  const navigate = useNavigate();
  const converters = getConverterPositions();
  const defenders = getDefenderPositions();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <Eye className="w-7 h-7 text-purple-400" />
            <h1 className="text-2xl font-serif font-bold text-foreground">The Oracle</h1>
          </div>
          <p className="text-muted-foreground">Endgame mastery. Play against perfect Stockfish defense or offense.</p>
        </motion.div>

        {/* Converter */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Swords className="w-5 h-5 text-orange-400" />
            <h2 className="font-semibold text-foreground">Converter — Deliver Checkmate</h2>
          </div>
          <div className="grid gap-3">
            {converters.map((pos, i) => (
              <motion.div
                key={pos.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/oracle/trial/${pos.id}`)}
                className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card cursor-pointer hover:border-purple-500/40 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400 font-bold text-sm">
                  {pos.difficulty}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-sm">{pos.name}</h3>
                  <p className="text-xs text-muted-foreground">{pos.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Defender */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-blue-400" />
            <h2 className="font-semibold text-foreground">Defender — Hold the Draw</h2>
          </div>
          <div className="grid gap-3">
            {defenders.map((pos, i) => (
              <motion.div
                key={pos.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/oracle/trial/${pos.id}`)}
                className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card cursor-pointer hover:border-purple-500/40 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-sm">
                  {pos.difficulty}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-sm">{pos.name}</h3>
                  <p className="text-xs text-muted-foreground">{pos.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
