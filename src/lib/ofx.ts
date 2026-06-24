export interface OFXTransaction {
  date: string
  description: string
  value: number
  type: 'income' | 'expense'
  bank: string
}

export function parseOFX(text: string): { bank: string; transactions: OFXTransaction[] } {
  const result: OFXTransaction[] = []
  let bank = 'Banco'

  const content = text.replace(/<(\/?)OFX[^>]*>/g, '<$1OFX>')

  const orgMatch = content.match(/<ORG>(.*?)<\/ORG>/i)
  if (orgMatch) {
    const orgs: Record<string, string> = {
      '033': 'Santander', '001': 'Banco do Brasil', '104': 'Caixa', '341': 'Itaú',
      '237': 'Bradesco', '260': 'Nubank', '336': 'C6', '077': 'Inter', '399': 'Kirton',
    }
    bank = orgs[orgMatch[1]] || bank
  }

  const fiMatch = content.match(/<FID>(.*?)<\/FID>/i)
  if (fiMatch) {
    const banks: Record<string, string> = {
      '033': 'Santander', '001': 'Banco do Brasil', '104': 'Caixa', '341': 'Itaú',
      '237': 'Bradesco', '260': 'Nubank', '336': 'C6', '077': 'Inter',
    }
    bank = banks[fiMatch[1]] || bank
  }

  const bankMatch = content.match(/<BANKID>(.*?)<\/BANKID>/i)
  if (bankMatch) {
    const ids: Record<string, string> = {
      '033': 'Santander', '001': 'Banco do Brasil', '104': 'Caixa', '341': 'Itaú',
      '237': 'Bradesco', '260': 'Nubank',
    }
    bank = ids[bankMatch[1]] || bank
  }

  const stmttrnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi
  let match

  while ((match = stmttrnRegex.exec(content)) !== null) {
    const block = match[1]

    const trnType = extract(block, 'TRNTYPE')
    const dtPosted = extract(block, 'DTPOSTED')
    const trnAmt = extract(block, 'TRNAMT')
    const memo = extract(block, 'MEMO')
    const description = extract(block, 'NAME') || memo || 'Lançamento'

    if (!trnAmt || !dtPosted) continue

    const amount = parseFloat(trnAmt.replace(',', '.'))
    if (isNaN(amount)) continue

    const isCredit = trnType?.toUpperCase() === 'CREDIT' || trnType?.toUpperCase() === 'DEP'

    let date = dtPosted
    if (date.length >= 8) {
      date = `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`
    } else if (date.length >= 10) {
      date = `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`
    }

    result.push({
      date,
      description: description || 'Lançamento',
      value: Math.abs(amount),
      type: amount > 0 || isCredit ? 'income' : 'expense',
      bank,
    })
  }

  if (result.length === 0) {
    const tableRegex = /<TRNROW>([\s\S]*?)<\/TRNROW>/gi
    while ((match = tableRegex.exec(content)) !== null) {
      const block = match[1]
      const dt = extract(block, 'DTPOSTED') || extract(block, 'FITID')
      const amt = extract(block, 'TRNAMT')
      const desc = extract(block, 'MEMO') || extract(block, 'NAME') || 'Lançamento'

      if (!amt || !dt) continue
      const amount = parseFloat(amt.replace(',', '.'))

      let date = dt
      if (date && date.length >= 8) {
        date = `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`
      }

      result.push({
        date,
        description: desc,
        value: Math.abs(amount),
        type: amount > 0 ? 'income' : 'expense',
        bank,
      })
    }
  }

  return { bank, transactions: result }
}

function extract(text: string, tag: string): string {
  const regex = new RegExp(`<${tag}>(.*?)<\\/${tag}>`, 'i')
  const match = text.match(regex)
  return (match?.[1] || '').trim()
}

export function isOFX(text: string): boolean {
  return text.includes('OFXHEADER') || text.includes('<OFX>') || text.includes('<ofx>')
}
